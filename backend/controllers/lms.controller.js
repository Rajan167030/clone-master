import mongoose from "mongoose";
import {
  Course,
  Enrollment,
  AssignmentSubmission,
  LiveSession,
  CohortApplication,
  Account,
} from "../models/index.js";
import { LESSON_TYPES, ACCESS_LEVELS } from "../models/lms.model.js";
import { sendEmail } from "../utils/email.js";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const FRONTEND_URL = () =>
  (process.env.FRONTEND_URL || process.env.HOST_URL || "https://foundersconnect.co.in").replace(/\/+$/, "");
const str = (v, max = 5000) => String(v ?? "").trim().slice(0, max);
const num = (v, min, max, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const isHttpUrl = (v) => !v || /^https?:\/\//i.test(v);
const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const httpError = (status, message) => Object.assign(new Error(message), { status });
const isAdminRole = (role) => role === "admin" || role === "superadmin";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "course";

const emailShell = (title, bodyHtml, cta) => `
<div style="background:#f5f3ff;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1e1b2e">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e9e5f7;border-radius:14px;overflow:hidden">
    <div style="height:4px;background:#7c3aed"></div>
    <div style="padding:28px">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;font-weight:700">Founders Connect · Learning</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#1e1b2e">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#4b4763">${bodyHtml}</div>
      ${cta ? `<p style="margin:24px 0 0"><a href="${cta.href}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600;font-size:14px">${cta.label}</a></p>` : ""}
    </div>
  </div>
</div>`;

/**
 * Who is looking, and which cohorts they're an accepted member of. Computed once per request.
 * Cohort membership = an *accepted* cohort application under the same email as the account.
 */
const getViewer = async (req) => {
  if (req._lmsViewer) return req._lmsViewer;
  const user = req.user || null;
  let cohortSlugs = [];
  if (user?.email && !isAdminRole(user.role)) {
    cohortSlugs = await CohortApplication.distinct("cohortSlug", {
      email: String(user.email).toLowerCase(),
      status: "accepted",
    });
  }
  req._lmsViewer = user
    ? { id: String(user.id || user.sub), email: user.email, role: user.role, isAdmin: isAdminRole(user.role), cohortSlugs }
    : null;
  return req._lmsViewer;
};

/** Returns null if the viewer can access `item`, otherwise the reason it's locked. */
const lockReason = (item, viewer) => {
  if (item.access === "public") return null;
  if (!viewer) return "login";
  if (viewer.isAdmin || item.access === "members") return null;
  const allowed = item.cohortSlugs || [];
  return allowed.some((s) => viewer.cohortSlugs.includes(s)) ? null : "cohort";
};

const allLessons = (course) => (course.modules || []).flatMap((m) => m.lessons || []);

const findLesson = (course, lessonId) => {
  for (const mod of course.modules || []) {
    for (const lesson of mod.lessons || []) {
      if (String(lesson._id) === String(lessonId)) return lesson;
    }
  }
  return null;
};

const progressFor = (course, enrollment) => {
  const ids = allLessons(course).map((l) => String(l._id));
  const done = new Set(enrollment?.completedLessonIds || []);
  const completed = ids.filter((id) => done.has(id)).length;
  const nextLesson = allLessons(course).find((l) => !done.has(String(l._id))) || null;
  return {
    totalLessons: ids.length,
    completedLessons: completed,
    percent: ids.length ? Math.round((completed / ids.length) * 100) : 0,
    nextLessonId: nextLesson ? String(nextLesson._id) : null,
    nextLessonTitle: nextLesson?.title || null,
  };
};

const courseSummary = (course) => {
  const lessons = allLessons(course);
  return {
    _id: course._id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    coverImageUrl: course.coverImageUrl,
    category: course.category,
    level: course.level,
    tags: course.tags,
    instructorName: course.instructorName,
    instructorTitle: course.instructorTitle,
    instructorPhotoUrl: course.instructorPhotoUrl,
    access: course.access,
    cohortSlugs: course.cohortSlugs,
    moduleCount: (course.modules || []).length,
    lessonCount: lessons.length,
    totalMinutes: lessons.reduce((s, l) => s + (l.durationMinutes || 0), 0),
  };
};

/** Public lesson shape. Quiz answers are never sent; gated content only when unlocked. */
const serializeLesson = (lesson, unlocked) => {
  const open = unlocked || lesson.isPreview;
  const base = {
    _id: String(lesson._id),
    title: lesson.title,
    type: lesson.type,
    summary: lesson.summary,
    durationMinutes: lesson.durationMinutes,
    isPreview: lesson.isPreview,
    locked: !open,
    liveAt: lesson.liveAt,
    questionCount: (lesson.quizQuestions || []).length,
  };
  if (!open) return base;
  return {
    ...base,
    videoUrl: lesson.videoUrl,
    content: lesson.content,
    resources: lesson.resources,
    liveUrl: lesson.liveUrl,
    quizPassPercent: lesson.quizPassPercent,
    quizQuestions: (lesson.quizQuestions || []).map((q) => ({ _id: String(q._id), question: q.question, options: q.options })),
    assignmentInstructions: lesson.assignmentInstructions,
  };
};

const serializeLiveSession = (session, viewer) => {
  const reason = lockReason(session, viewer);
  const endsAt = new Date(new Date(session.startsAt).getTime() + (session.durationMinutes || 60) * 60000);
  return {
    _id: session._id,
    title: session.title,
    description: session.description,
    hostName: session.hostName,
    hostTitle: session.hostTitle,
    startsAt: session.startsAt,
    endsAt,
    durationMinutes: session.durationMinutes,
    coverImageUrl: session.coverImageUrl,
    access: session.access,
    courseSlug: session.courseSlug,
    locked: Boolean(reason),
    lockReason: reason,
    hasRecording: Boolean(session.recordingUrl),
    joinUrl: reason ? "" : session.joinUrl,
    recordingUrl: reason ? "" : session.recordingUrl,
  };
};

const loadPublishedCourse = async (slug) => {
  const course = await Course.findOne({ slug: str(slug, 120), isPublished: true }).lean();
  if (!course) throw httpError(404, "Course not found.");
  return course;
};

/** Ensures the viewer may use this course and returns (creating if needed) their enrollment. */
const requireEnrollment = async (req, course) => {
  const viewer = await getViewer(req);
  const reason = lockReason(course, viewer);
  if (reason === "login") throw httpError(401, "Please log in to continue.");
  if (reason === "cohort") throw httpError(403, "This course is only available to members of its cohort.");

  const account = await Account.findById(viewer.id).select("fullName email").lean();
  const enrollment = await Enrollment.findOneAndUpdate(
    { accountId: viewer.id, courseId: course._id },
    {
      $setOnInsert: {
        courseSlug: course.slug,
        email: account?.email || viewer.email || "",
        fullName: account?.fullName || "",
      },
      $set: { lastActivityAt: new Date() },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return { viewer, enrollment };
};

const markComplete = async (course, enrollment, lessonId) => {
  if (!enrollment.completedLessonIds.includes(lessonId)) enrollment.completedLessonIds.push(lessonId);
  enrollment.lastLessonId = lessonId;
  const progress = progressFor(course, enrollment);
  if (progress.percent === 100 && !enrollment.completedAt) enrollment.completedAt = new Date();
  await enrollment.save();
  return progress;
};

const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    return next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Learner endpoints                                                   */
/* ------------------------------------------------------------------ */

export const listCourses = handle(async (req, res) => {
  const viewer = await getViewer(req);
  const courses = await Course.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean();
  const enrollments = viewer
    ? await Enrollment.find({ accountId: viewer.id, courseId: { $in: courses.map((c) => c._id) } }).lean()
    : [];
  const byCourse = new Map(enrollments.map((e) => [String(e.courseId), e]));

  res.status(200).json({
    courses: courses.map((c) => {
      const reason = lockReason(c, viewer);
      const enrollment = byCourse.get(String(c._id));
      return {
        ...courseSummary(c),
        locked: Boolean(reason),
        lockReason: reason,
        enrolled: Boolean(enrollment),
        progress: enrollment ? progressFor(c, enrollment) : null,
      };
    }),
  });
});

export const getCourse = handle(async (req, res) => {
  const viewer = await getViewer(req);
  const course = await loadPublishedCourse(req.params.slug);
  const reason = lockReason(course, viewer);
  const enrollment = viewer ? await Enrollment.findOne({ accountId: viewer.id, courseId: course._id }).lean() : null;
  const submissions = viewer
    ? await AssignmentSubmission.find({ accountId: viewer.id, courseId: course._id }).lean()
    : [];

  res.status(200).json({
    course: {
      ...courseSummary(course),
      description: course.description,
      locked: Boolean(reason),
      lockReason: reason,
      modules: (course.modules || []).map((m) => ({
        _id: String(m._id),
        title: m.title,
        description: m.description,
        lessons: (m.lessons || []).map((l) => serializeLesson(l, !reason)),
      })),
    },
    enrollment: enrollment
      ? {
          completedLessonIds: enrollment.completedLessonIds,
          lastLessonId: enrollment.lastLessonId,
          completedAt: enrollment.completedAt,
          quizAttempts: enrollment.quizAttempts.map(({ lessonId, scorePercent, passed, at }) => ({ lessonId, scorePercent, passed, at })),
          progress: progressFor(course, enrollment),
        }
      : null,
    submissions: submissions.map((s) => ({
      lessonId: s.lessonId,
      text: s.text,
      linkUrl: s.linkUrl,
      status: s.status,
      feedback: s.feedback,
      grade: s.grade,
      updatedAt: s.updatedAt,
    })),
  });
});

export const enrollCourse = handle(async (req, res) => {
  const course = await loadPublishedCourse(req.params.slug);
  const { enrollment } = await requireEnrollment(req, course);
  res.status(200).json({ message: "Enrolled.", progress: progressFor(course, enrollment) });
});

export const setLessonComplete = handle(async (req, res) => {
  const course = await loadPublishedCourse(req.params.slug);
  const lesson = findLesson(course, req.params.lessonId);
  if (!lesson) throw httpError(404, "Lesson not found.");
  if (lesson.type === "quiz") throw httpError(400, "Pass the quiz to complete this lesson.");
  if (lesson.type === "assignment") throw httpError(400, "Submit the assignment to complete this lesson.");

  const { enrollment } = await requireEnrollment(req, course);
  const lessonId = String(lesson._id);
  let progress;
  if (req.method === "DELETE") {
    enrollment.completedLessonIds = enrollment.completedLessonIds.filter((id) => id !== lessonId);
    enrollment.completedAt = null;
    await enrollment.save();
    progress = progressFor(course, enrollment);
  } else {
    progress = await markComplete(course, enrollment, lessonId);
  }
  res.status(200).json({ completedLessonIds: enrollment.completedLessonIds, progress });
});

export const submitQuiz = handle(async (req, res) => {
  const course = await loadPublishedCourse(req.params.slug);
  const lesson = findLesson(course, req.params.lessonId);
  if (!lesson || lesson.type !== "quiz") throw httpError(404, "Quiz not found.");
  const questions = lesson.quizQuestions || [];
  if (!questions.length) throw httpError(400, "This quiz has no questions yet.");

  const answers = Array.isArray(req.body?.answers) ? req.body.answers.map((a) => Number(a)) : [];
  if (answers.length !== questions.length || answers.some((a) => !Number.isInteger(a))) {
    throw httpError(400, "Please answer every question.");
  }

  const { enrollment } = await requireEnrollment(req, course);
  const results = questions.map((q, i) => ({
    questionId: String(q._id),
    selectedIndex: answers[i],
    correctIndex: q.correctIndex,
    correct: answers[i] === q.correctIndex,
    explanation: q.explanation,
  }));
  const correct = results.filter((r) => r.correct).length;
  const scorePercent = Math.round((correct / questions.length) * 100);
  const passed = scorePercent >= (lesson.quizPassPercent ?? 70);

  enrollment.quizAttempts.push({ lessonId: String(lesson._id), scorePercent, passed, answers });
  if (enrollment.quizAttempts.length > 200) enrollment.quizAttempts = enrollment.quizAttempts.slice(-200);
  const progress = passed ? await markComplete(course, enrollment, String(lesson._id)) : (await enrollment.save(), progressFor(course, enrollment));

  res.status(200).json({
    scorePercent,
    passed,
    passPercent: lesson.quizPassPercent ?? 70,
    correct,
    total: questions.length,
    results,
    completedLessonIds: enrollment.completedLessonIds,
    progress,
  });
});

export const submitAssignment = handle(async (req, res) => {
  const course = await loadPublishedCourse(req.params.slug);
  const lesson = findLesson(course, req.params.lessonId);
  if (!lesson || lesson.type !== "assignment") throw httpError(404, "Assignment not found.");

  const text = str(req.body?.text, 10000);
  const linkUrl = str(req.body?.linkUrl, 500);
  if (!text && !linkUrl) throw httpError(400, "Add your response or a link to your work.");
  if (!isHttpUrl(linkUrl)) throw httpError(400, "Link must start with http:// or https://");

  const { viewer, enrollment } = await requireEnrollment(req, course);
  const existing = await AssignmentSubmission.findOne({ accountId: viewer.id, courseId: course._id, lessonId: String(lesson._id) });
  if (existing?.status === "reviewed") throw httpError(409, "This assignment has already been reviewed.");

  const submission = await AssignmentSubmission.findOneAndUpdate(
    { accountId: viewer.id, courseId: course._id, lessonId: String(lesson._id) },
    {
      $set: {
        text,
        linkUrl,
        status: "submitted",
        email: enrollment.email,
        fullName: enrollment.fullName,
        courseSlug: course.slug,
        courseTitle: course.title,
        lessonTitle: lesson.title,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const progress = await markComplete(course, enrollment, String(lesson._id));

  res.status(200).json({
    message: "Assignment submitted.",
    submission: { lessonId: submission.lessonId, text, linkUrl, status: submission.status, feedback: submission.feedback, grade: submission.grade },
    completedLessonIds: enrollment.completedLessonIds,
    progress,
  });
});

export const listLiveSessions = handle(async (req, res) => {
  const viewer = await getViewer(req);
  const sessions = await LiveSession.find({ isPublished: true }).sort({ startsAt: 1 }).lean();
  const now = Date.now();
  const all = sessions.map((s) => serializeLiveSession(s, viewer));
  res.status(200).json({
    upcoming: all.filter((s) => new Date(s.endsAt).getTime() >= now),
    past: all.filter((s) => new Date(s.endsAt).getTime() < now).reverse(),
  });
});

/** Video library: recorded live sessions + video lessons from courses the viewer can access. */
export const getLibrary = handle(async (req, res) => {
  const viewer = await getViewer(req);
  const [courses, sessions] = await Promise.all([
    Course.find({ isPublished: true }).sort({ order: 1 }).lean(),
    LiveSession.find({ isPublished: true, recordingUrl: { $ne: "" }, startsAt: { $lt: new Date() } }).sort({ startsAt: -1 }).lean(),
  ]);

  const items = [];
  for (const s of sessions) {
    if (lockReason(s, viewer)) continue;
    items.push({
      kind: "recording",
      id: String(s._id),
      title: s.title,
      subtitle: [s.hostName, s.hostTitle].filter(Boolean).join(" · "),
      videoUrl: s.recordingUrl,
      durationMinutes: s.durationMinutes,
      date: s.startsAt,
      thumbnailUrl: s.coverImageUrl,
    });
  }
  for (const c of courses) {
    const unlocked = !lockReason(c, viewer);
    for (const l of allLessons(c)) {
      if (l.type !== "video" || !l.videoUrl || !(unlocked || l.isPreview)) continue;
      items.push({
        kind: "lesson",
        id: String(l._id),
        title: l.title,
        subtitle: c.title,
        courseSlug: c.slug,
        videoUrl: l.videoUrl,
        durationMinutes: l.durationMinutes,
        date: c.updatedAt,
        thumbnailUrl: c.coverImageUrl,
      });
    }
  }
  res.status(200).json({ items });
});

/** Founder learning dashboard. */
export const getMyLearning = handle(async (req, res) => {
  const viewer = await getViewer(req);
  const [enrollments, courses, sessions, submissions] = await Promise.all([
    Enrollment.find({ accountId: viewer.id }).sort({ lastActivityAt: -1 }).lean(),
    Course.find({ isPublished: true }).sort({ order: 1, createdAt: -1 }).lean(),
    LiveSession.find({ isPublished: true, startsAt: { $gte: new Date(Date.now() - 3 * 3600000) } }).sort({ startsAt: 1 }).limit(20).lean(),
    AssignmentSubmission.find({ accountId: viewer.id }).sort({ updatedAt: -1 }).limit(20).lean(),
  ]);
  const courseById = new Map(courses.map((c) => [String(c._id), c]));

  const myCourses = enrollments
    .map((e) => {
      const c = courseById.get(String(e.courseId));
      if (!c) return null;
      return { ...courseSummary(c), progress: progressFor(c, e), completedAt: e.completedAt, lastActivityAt: e.lastActivityAt };
    })
    .filter(Boolean);
  const enrolledIds = new Set(enrollments.map((e) => String(e.courseId)));
  const recommended = courses
    .filter((c) => !enrolledIds.has(String(c._id)) && !lockReason(c, viewer))
    .slice(0, 4)
    .map(courseSummary);

  const allLessonTotal = myCourses.reduce((s, c) => s + c.progress.completedLessons, 0);
  res.status(200).json({
    stats: {
      enrolled: myCourses.length,
      completed: myCourses.filter((c) => c.progress.percent === 100).length,
      lessonsCompleted: allLessonTotal,
      pendingFeedback: submissions.filter((s) => s.status === "submitted").length,
    },
    cohorts: viewer.cohortSlugs,
    courses: myCourses,
    recommended,
    upcomingSessions: sessions
      .map((s) => serializeLiveSession(s, viewer))
      .filter((s) => !s.locked && new Date(s.endsAt).getTime() >= Date.now())
      .slice(0, 5),
    submissions: submissions.map((s) => ({
      _id: s._id,
      courseSlug: s.courseSlug,
      courseTitle: s.courseTitle,
      lessonId: s.lessonId,
      lessonTitle: s.lessonTitle,
      status: s.status,
      feedback: s.feedback,
      grade: s.grade,
      updatedAt: s.updatedAt,
    })),
  });
});

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */

const keepId = (id) => (id && mongoose.isValidObjectId(id) ? { _id: id } : {});

const sanitizeCourse = (body = {}) => {
  const access = ACCESS_LEVELS.includes(body.access) ? body.access : "members";
  const course = {
    title: str(body.title, 200),
    subtitle: str(body.subtitle, 300),
    description: str(body.description, 20000),
    coverImageUrl: str(body.coverImageUrl, 500),
    category: str(body.category, 80),
    level: ["beginner", "intermediate", "advanced"].includes(body.level) ? body.level : "beginner",
    tags: (Array.isArray(body.tags) ? body.tags : String(body.tags || "").split(","))
      .map((t) => str(t, 40))
      .filter(Boolean)
      .slice(0, 12),
    instructorName: str(body.instructorName, 120),
    instructorTitle: str(body.instructorTitle, 160),
    instructorPhotoUrl: str(body.instructorPhotoUrl, 500),
    access,
    cohortSlugs: access === "cohort" ? (Array.isArray(body.cohortSlugs) ? body.cohortSlugs : []).map((s) => str(s, 120)).filter(Boolean) : [],
    isPublished: Boolean(body.isPublished),
    order: num(body.order, -10000, 10000, 0),
    modules: (Array.isArray(body.modules) ? body.modules : []).slice(0, 60).map((m) => ({
      ...keepId(m?._id),
      title: str(m?.title, 200) || "Untitled module",
      description: str(m?.description, 2000),
      lessons: (Array.isArray(m?.lessons) ? m.lessons : []).slice(0, 100).map((l) => ({
        ...keepId(l?._id),
        title: str(l?.title, 200) || "Untitled lesson",
        type: LESSON_TYPES.includes(l?.type) ? l.type : "video",
        summary: str(l?.summary, 1000),
        durationMinutes: num(l?.durationMinutes, 0, 1000, 0),
        isPreview: Boolean(l?.isPreview),
        videoUrl: str(l?.videoUrl, 500),
        content: str(l?.content, 50000),
        resources: (Array.isArray(l?.resources) ? l.resources : [])
          .map((r) => ({ label: str(r?.label, 120), url: str(r?.url, 500) }))
          .filter((r) => r.label && r.url)
          .slice(0, 20),
        liveAt: l?.liveAt ? new Date(l.liveAt) : null,
        liveUrl: str(l?.liveUrl, 500),
        quizPassPercent: num(l?.quizPassPercent, 0, 100, 70),
        quizQuestions: (Array.isArray(l?.quizQuestions) ? l.quizQuestions : []).slice(0, 50).map((q) => {
          const options = (Array.isArray(q?.options) ? q.options : []).map((o) => str(o, 300)).filter(Boolean).slice(0, 6);
          return {
            ...keepId(q?._id),
            question: str(q?.question, 1000) || "Untitled question",
            options,
            correctIndex: num(q?.correctIndex, 0, Math.max(0, options.length - 1), 0),
            explanation: str(q?.explanation, 1000),
          };
        }),
        assignmentInstructions: str(l?.assignmentInstructions, 10000),
      })),
    })),
  };

  if (!course.title) throw httpError(400, "Course title is required.");
  for (const url of [course.coverImageUrl, course.instructorPhotoUrl]) {
    if (!isHttpUrl(url)) throw httpError(400, "Image URLs must start with http:// or https://");
  }
  for (const l of course.modules.flatMap((m) => m.lessons)) {
    if (l.liveAt && Number.isNaN(l.liveAt.getTime())) l.liveAt = null;
    if (![l.videoUrl, l.liveUrl, ...l.resources.map((r) => r.url)].every(isHttpUrl)) {
      throw httpError(400, `Links in lesson "${l.title}" must start with http:// or https://`);
    }
    if (l.type === "quiz" && l.quizQuestions.some((q) => q.options.length < 2)) {
      throw httpError(400, `Every question in quiz "${l.title}" needs at least two options.`);
    }
  }
  if (course.access === "cohort" && course.cohortSlugs.length === 0) {
    throw httpError(400, "Pick at least one cohort for a cohort-only course.");
  }
  return course;
};

const uniqueCourseSlug = async (wanted, exceptId) => {
  const base = slugify(wanted);
  let candidate = base;
  let n = 1;
  while (await Course.exists({ slug: candidate, ...(exceptId ? { _id: { $ne: exceptId } } : {}) })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
};

export const adminListCourses = handle(async (req, res) => {
  const courses = await Course.find({}).sort({ order: 1, createdAt: -1 }).lean();
  const counts = await Enrollment.aggregate([
    { $group: { _id: "$courseId", enrolled: { $sum: 1 }, completed: { $sum: { $cond: [{ $ifNull: ["$completedAt", false] }, 1, 0] } } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c]));
  res.status(200).json({
    courses: courses.map((c) => ({
      ...courseSummary(c),
      isPublished: c.isPublished,
      order: c.order,
      updatedAt: c.updatedAt,
      enrolled: byId.get(String(c._id))?.enrolled || 0,
      completed: byId.get(String(c._id))?.completed || 0,
    })),
  });
});

export const adminGetCourse = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Course not found.");
  const course = await Course.findById(req.params.id).lean();
  if (!course) throw httpError(404, "Course not found.");
  res.status(200).json({ course });
});

export const adminCreateCourse = handle(async (req, res) => {
  const payload = sanitizeCourse(req.body);
  payload.slug = await uniqueCourseSlug(req.body?.slug || payload.title);
  const course = await Course.create(payload);
  res.status(201).json({ message: "Course created.", course });
});

export const adminUpdateCourse = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Course not found.");
  const course = await Course.findById(req.params.id);
  if (!course) throw httpError(404, "Course not found.");
  const payload = sanitizeCourse(req.body);
  const previousSlug = course.slug;
  payload.slug = req.body?.slug ? await uniqueCourseSlug(req.body.slug, course._id) : previousSlug;
  course.set(payload);
  await course.save();
  if (payload.slug !== previousSlug) {
    await Promise.all([
      Enrollment.updateMany({ courseId: course._id }, { $set: { courseSlug: payload.slug } }),
      AssignmentSubmission.updateMany({ courseId: course._id }, { $set: { courseSlug: payload.slug } }),
    ]);
  }
  res.status(200).json({ message: "Course saved.", course });
});

export const adminDeleteCourse = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Course not found.");
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) throw httpError(404, "Course not found.");
  await Promise.all([
    Enrollment.deleteMany({ courseId: course._id }),
    AssignmentSubmission.deleteMany({ courseId: course._id }),
  ]);
  res.status(200).json({ message: "Course deleted." });
});

export const adminCourseLearners = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Course not found.");
  const course = await Course.findById(req.params.id).lean();
  if (!course) throw httpError(404, "Course not found.");
  const enrollments = await Enrollment.find({ courseId: course._id }).sort({ lastActivityAt: -1 }).limit(1000).lean();
  res.status(200).json({
    learners: enrollments.map((e) => ({
      _id: e._id,
      fullName: e.fullName,
      email: e.email,
      progress: progressFor(course, e),
      completedAt: e.completedAt,
      enrolledAt: e.createdAt,
      lastActivityAt: e.lastActivityAt,
    })),
  });
});

const sanitizeLiveSession = (body = {}) => {
  const access = ACCESS_LEVELS.includes(body.access) ? body.access : "members";
  const startsAt = new Date(body.startsAt);
  const session = {
    title: str(body.title, 200),
    description: str(body.description, 5000),
    hostName: str(body.hostName, 120),
    hostTitle: str(body.hostTitle, 160),
    startsAt,
    durationMinutes: num(body.durationMinutes, 5, 600, 60),
    joinUrl: str(body.joinUrl, 500),
    recordingUrl: str(body.recordingUrl, 500),
    coverImageUrl: str(body.coverImageUrl, 500),
    access,
    cohortSlugs: access === "cohort" ? (Array.isArray(body.cohortSlugs) ? body.cohortSlugs : []).map((s) => str(s, 120)).filter(Boolean) : [],
    courseSlug: str(body.courseSlug, 120),
    isPublished: body.isPublished === undefined ? true : Boolean(body.isPublished),
  };
  if (!session.title) throw httpError(400, "Session title is required.");
  if (Number.isNaN(startsAt.getTime())) throw httpError(400, "A valid start date/time is required.");
  if (![session.joinUrl, session.recordingUrl, session.coverImageUrl].every(isHttpUrl)) {
    throw httpError(400, "Links must start with http:// or https://");
  }
  if (session.access === "cohort" && session.cohortSlugs.length === 0) {
    throw httpError(400, "Pick at least one cohort for a cohort-only session.");
  }
  return session;
};

export const adminListLiveSessions = handle(async (req, res) => {
  const sessions = await LiveSession.find({}).sort({ startsAt: -1 }).lean();
  res.status(200).json({ sessions });
});

export const adminCreateLiveSession = handle(async (req, res) => {
  const session = await LiveSession.create(sanitizeLiveSession(req.body));
  res.status(201).json({ message: "Live session created.", session });
});

export const adminUpdateLiveSession = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Session not found.");
  const session = await LiveSession.findByIdAndUpdate(req.params.id, { $set: sanitizeLiveSession(req.body) }, { new: true });
  if (!session) throw httpError(404, "Session not found.");
  res.status(200).json({ message: "Live session saved.", session });
});

export const adminDeleteLiveSession = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Session not found.");
  const session = await LiveSession.findByIdAndDelete(req.params.id);
  if (!session) throw httpError(404, "Session not found.");
  res.status(200).json({ message: "Live session deleted." });
});

export const adminListSubmissions = handle(async (req, res) => {
  const filter = {};
  if (["submitted", "reviewed", "needs-revision"].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.course) filter.courseSlug = str(req.query.course, 120);
  const submissions = await AssignmentSubmission.find(filter).sort({ updatedAt: -1 }).limit(500).lean();
  res.status(200).json({ submissions });
});

export const adminReviewSubmission = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Submission not found.");
  const status = req.body?.status;
  if (!["reviewed", "needs-revision"].includes(status)) throw httpError(400, "Status must be 'reviewed' or 'needs-revision'.");
  const feedback = str(req.body?.feedback, 5000);
  if (status === "needs-revision" && !feedback) throw httpError(400, "Add feedback explaining what to revise.");

  const submission = await AssignmentSubmission.findByIdAndUpdate(
    req.params.id,
    { $set: { status, feedback, grade: str(req.body?.grade, 40), reviewedAt: new Date() } },
    { new: true },
  );
  if (!submission) throw httpError(404, "Submission not found.");

  // A revision request re-opens the lesson so the founder's progress reflects it.
  if (status === "needs-revision") {
    await Enrollment.updateOne(
      { accountId: submission.accountId, courseId: submission.courseId },
      { $pull: { completedLessonIds: submission.lessonId }, $set: { completedAt: null } },
    );
  }

  let emailed = false;
  if (submission.email) {
    emailed = await sendEmail({
      to: submission.email,
      subject: `Feedback on "${submission.lessonTitle}" — Founders Connect`,
      html: emailShell(
        status === "reviewed" ? "Your assignment has been reviewed" : "Your assignment needs a revision",
        `<p style="margin:0 0 12px">Hi ${escapeHtml(submission.fullName || "there")}, our team has reviewed your submission for <strong>${escapeHtml(submission.lessonTitle)}</strong> in <em>${escapeHtml(submission.courseTitle)}</em>.</p>
         ${submission.grade ? `<p style="margin:0 0 12px"><strong>Grade:</strong> ${escapeHtml(submission.grade)}</p>` : ""}
         ${feedback ? `<p style="margin:0;padding:12px;background:#f8f7fc;border-radius:8px;white-space:pre-wrap">${escapeHtml(feedback)}</p>` : ""}`,
        { href: `${FRONTEND_URL()}/learn/${submission.courseSlug}?lesson=${submission.lessonId}`, label: "Open the lesson" },
      ),
    })
      .then((r) => Boolean(r?.ok))
      .catch(() => false);
  }
  res.status(200).json({ message: "Review saved.", submission, emailed });
});

export const adminLearningStats = handle(async (req, res) => {
  const [courses, published, enrollments, completions, pendingSubmissions, upcomingSessions] = await Promise.all([
    Course.countDocuments({}),
    Course.countDocuments({ isPublished: true }),
    Enrollment.countDocuments({}),
    Enrollment.countDocuments({ completedAt: { $ne: null } }),
    AssignmentSubmission.countDocuments({ status: "submitted" }),
    LiveSession.countDocuments({ startsAt: { $gte: new Date() } }),
  ]);
  res.status(200).json({ courses, published, enrollments, completions, pendingSubmissions, upcomingSessions });
});

/* ------------------------------------------------------------------ */
/* Context for the AI learning assistant (respects course access)      */
/* ------------------------------------------------------------------ */

export const getLearningContextForAssistant = async (req, courseSlug, lessonId) => {
  const viewer = await getViewer(req);
  const courses = await Course.find({ isPublished: true }).sort({ order: 1 }).lean();
  const catalog = courses
    .filter((c) => !lockReason(c, viewer))
    .slice(0, 30)
    .map((c) => ({ slug: c.slug, title: c.title, category: c.category, level: c.level }));

  let lesson = null;
  const course = courseSlug ? courses.find((c) => c.slug === courseSlug) : null;
  if (course) {
    const found = lessonId ? findLesson(course, lessonId) : null;
    const unlocked = !lockReason(course, viewer);
    lesson = {
      courseTitle: course.title,
      courseSlug: course.slug,
      lessonTitle: found?.title || "",
      // Only pass gated content to the model if this viewer could read it themselves.
      lessonText: found && (unlocked || found.isPreview) ? [found.summary, found.content, found.assignmentInstructions].filter(Boolean).join("\n\n").slice(0, 12000) : "",
    };
  }
  return { catalog, lesson };
};
