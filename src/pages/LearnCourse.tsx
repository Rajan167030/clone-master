import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  Bot,
  Menu,
  Radio,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import VideoEmbed from "@/components/learning/VideoEmbed";
import QuizPanel from "@/components/learning/QuizPanel";
import AssignmentPanel from "@/components/learning/AssignmentPanel";
import AssistantChat from "@/components/ai/AssistantChat";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";
import {
  enrollCourseApi,
  getCourseApi,
  setLessonCompleteApi,
  type CourseProgress,
  type LearnerCourse,
  type LearnerEnrollment,
  type LearnerLesson,
  type AssistantThread,
  type LearnerSubmission,
} from "@/lib/api";
import { getToken } from "@/lib/session";
import { ACCESS_LABEL, LESSON_META, formatDateTime, formatMinutes, lockMessage } from "@/lib/lms";

const LockedCard = ({ reason, token }: { reason: LearnerCourse["lockReason"]; token: string | null }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
    <Lock className="mx-auto mb-3 h-8 w-8 text-violet-500" />
    <p className="font-semibold text-slate-900">{lockMessage(reason)}</p>
    <div className="mt-5 flex justify-center gap-3">
      {!token ? (
        <>
          <Button asChild className="bg-violet-600 hover:bg-violet-700"><Link to="/login">Log in</Link></Button>
          <Button asChild variant="outline"><Link to="/register/founder">Create account</Link></Button>
        </>
      ) : (
        <Button asChild className="bg-violet-600 hover:bg-violet-700"><Link to="/cohorts">Explore cohorts</Link></Button>
      )}
    </div>
  </div>
);

const LearnCourse = () => {
  const { slug = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = getToken();

  const [course, setCourse] = useState<LearnerCourse | null>(null);
  const [enrollment, setEnrollment] = useState<LearnerEnrollment | null>(null);
  const [submissions, setSubmissions] = useState<LearnerSubmission[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorThread, setTutorThread] = useState<AssistantThread | null>(null);

  useSEO({
    title: course ? `${course.title} | Founder Academy` : "Course | Founder Academy",
    description: course?.subtitle || "A Founders Connect course for startup founders.",
  });

  const load = useCallback(() => {
    getCourseApi(slug, token)
      .then((r) => {
        setCourse(r.course);
        setEnrollment(r.enrollment);
        setSubmissions(r.submissions);
      })
      .catch((e) => setError(e.message));
  }, [slug, token]);

  useEffect(load, [load]);

  const lessons = useMemo(() => (course?.modules || []).flatMap((m) => m.lessons), [course]);
  const lessonId = params.get("lesson");
  const current = lessons.find((l) => l._id === lessonId) || null;
  const currentIndex = current ? lessons.indexOf(current) : -1;
  const done = useMemo(() => new Set(enrollment?.completedLessonIds || []), [enrollment]);

  const openLesson = (id: string) => {
    setParams({ lesson: id });
    setOutlineOpen(false);
    window.scrollTo({ top: 0 });
  };

  const applyProgress = (completedLessonIds: string[], progress: CourseProgress) =>
    setEnrollment((prev) => ({
      completedLessonIds,
      progress,
      lastLessonId: prev?.lastLessonId || "",
      completedAt: progress.percent === 100 ? prev?.completedAt || new Date().toISOString() : null,
      quizAttempts: prev?.quizAttempts || [],
    }));

  const startCourse = async () => {
    if (!token) return navigate("/login");
    setBusy(true);
    try {
      const res = await enrollCourseApi(token, slug);
      applyProgress(enrollment?.completedLessonIds || [], res.progress);
      const target = enrollment?.lastLessonId || res.progress.nextLessonId || lessons[0]?._id;
      if (target) openLesson(target);
    } catch (e) {
      toast({ title: "Could not start course", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const toggleComplete = async (lesson: LearnerLesson) => {
    if (!token) return navigate("/login");
    setBusy(true);
    try {
      const res = await setLessonCompleteApi(token, slug, lesson._id, !done.has(lesson._id));
      applyProgress(res.completedLessonIds, res.progress);
      if (res.progress.percent === 100 && !done.has(lesson._id)) {
        toast({ title: "Course complete!", description: "Great work, you've finished every lesson." });
      }
    } catch (e) {
      toast({ title: "Could not update progress", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="container mx-auto max-w-xl px-4 py-20 text-center">
          <p className="text-lg font-semibold text-slate-900">{error}</p>
          <Button asChild variant="outline" className="mt-6"><Link to="/learn">Back to courses</Link></Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-violet-600" /></div>
      </div>
    );
  }

  const progress = enrollment?.progress;
  const quizAttempts = (id: string) => (enrollment?.quizAttempts || []).filter((a) => a.lessonId === id);

  const outline = (
    <nav className="space-y-5">
      {course.modules.map((m, mi) => (
        <div key={m._id}>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Module {mi + 1} · {m.title}
          </p>
          <ul className="space-y-1">
            {m.lessons.map((l) => {
              const Icon = LESSON_META[l.type].icon;
              const active = current?._id === l._id;
              return (
                <li key={l._id}>
                  <button
                    type="button"
                    onClick={() => openLesson(l._id)}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      active ? "bg-violet-100 text-violet-900" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {done.has(l._id) ? (
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    ) : l.locked ? (
                      <Lock size={15} className="mt-0.5 shrink-0 text-slate-400" />
                    ) : (
                      <Circle size={16} className="mt-0.5 shrink-0 text-slate-300" />
                    )}
                    <span className="flex-1">
                      <span className="block leading-snug">{l.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                        <Icon size={11} /> {LESSON_META[l.type].label}
                        {l.durationMinutes ? ` · ${formatMinutes(l.durationMinutes)}` : ""}
                        {l.isPreview && course.locked ? " · Free preview" : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const renderLesson = (lesson: LearnerLesson) => {
    if (lesson.locked) return <LockedCard reason={course.lockReason} token={token} />;
    const attempts = quizAttempts(lesson._id);
    const submission = submissions.find((s) => s.lessonId === lesson._id);
    const manual = lesson.type !== "quiz" && lesson.type !== "assignment";

    return (
      <div className="space-y-6">
        {lesson.type === "live" && (
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-800">
              <Radio size={15} /> Live session {lesson.liveAt ? `· ${formatDateTime(lesson.liveAt)}` : ""}
            </p>
            {lesson.liveUrl ? (
              <Button asChild size="sm" className="mt-3 bg-violet-600 hover:bg-violet-700">
                <a href={lesson.liveUrl} target="_blank" rel="noreferrer">Join session <ExternalLink size={13} className="ml-1.5" /></a>
              </Button>
            ) : (
              <p className="mt-1 text-sm text-slate-600">The join link will be posted here before the session starts.</p>
            )}
          </div>
        )}

        {lesson.videoUrl && <VideoEmbed url={lesson.videoUrl} title={lesson.title} />}

        {lesson.content && (
          <div className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">{lesson.content}</div>
        )}

        {lesson.type === "quiz" && (
          <QuizPanel
            slug={slug}
            lesson={lesson}
            token={token}
            passed={done.has(lesson._id)}
            bestScore={attempts.length ? Math.max(...attempts.map((a) => a.scorePercent)) : null}
            onResult={(r) => {
              applyProgress(r.completedLessonIds, r.progress);
              setEnrollment((prev) =>
                prev
                  ? { ...prev, quizAttempts: [...prev.quizAttempts, { lessonId: lesson._id, scorePercent: r.scorePercent, passed: r.passed, at: new Date().toISOString() }] }
                  : prev,
              );
            }}
          />
        )}

        {lesson.type === "assignment" && (
          <AssignmentPanel
            slug={slug}
            lesson={lesson}
            token={token}
            submission={submission}
            onSubmitted={(r) => {
              applyProgress(r.completedLessonIds, r.progress);
              setSubmissions((prev) => [...prev.filter((s) => s.lessonId !== lesson._id), r.submission]);
              toast({ title: "Assignment submitted", description: "We'll email you when it's been reviewed." });
            }}
          />
        )}

        {(lesson.resources || []).length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Resources</p>
            <ul className="space-y-2">
              {lesson.resources!.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-violet-300 hover:text-violet-700">
                    <ExternalLink size={14} /> {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          {manual && token && !course.locked ? (
            <Button variant={done.has(lesson._id) ? "outline" : "default"} disabled={busy} onClick={() => toggleComplete(lesson)} className={done.has(lesson._id) ? "" : "bg-violet-600 hover:bg-violet-700"}>
              {done.has(lesson._id) ? <><CheckCircle2 size={15} className="mr-1.5 text-emerald-600" /> Completed</> : "Mark as complete"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" disabled={currentIndex <= 0} onClick={() => openLesson(lessons[currentIndex - 1]._id)}>
              <ArrowLeft size={15} className="mr-1" /> Previous
            </Button>
            <Button variant="outline" disabled={currentIndex >= lessons.length - 1} onClick={() => openLesson(lessons[currentIndex + 1]._id)}>
              Next <ArrowRight size={15} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <Link to="/learn" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-700">
              <ArrowLeft size={12} /> All courses
            </Link>
            <h1 className="mt-1 truncate font-heading text-xl font-bold text-slate-900 sm:text-2xl">{course.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            {progress && (
              <div className="w-48">
                <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
                  <span>{progress.completedLessons}/{progress.totalLessons} lessons</span>
                  <span>{progress.percent}%</span>
                </div>
                <Progress value={progress.percent} className="h-1.5" />
              </div>
            )}
            {token && !course.locked && (
              <Button variant="outline" size="sm" onClick={() => setTutorOpen(true)}>
                <Bot size={15} className="mr-1.5 text-violet-600" /> Ask AI tutor
              </Button>
            )}
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOutlineOpen(true)}>
              <Menu size={15} className="mr-1.5" /> Lessons
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4">{outline}</div>
        </aside>

        <main className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          {current ? (
            <>
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-violet-600">
                {(() => {
                  const Icon = LESSON_META[current.type].icon;
                  return <Icon size={13} />;
                })()}
                {LESSON_META[current.type].label}
                {current.durationMinutes ? ` · ${formatMinutes(current.durationMinutes)}` : ""}
              </p>
              <h2 className="font-heading text-2xl font-bold text-slate-900">{current.title}</h2>
              {current.summary && <p className="mt-1 text-slate-600">{current.summary}</p>}
              <div className="mt-6">{renderLesson(current)}</div>
            </>
          ) : (
            <div className="space-y-6">
              {course.coverImageUrl && (
                <img src={course.coverImageUrl} alt="" className="aspect-[21/9] w-full rounded-xl object-cover" />
              )}
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-violet-800">{ACCESS_LABEL[course.access]}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 capitalize text-slate-700">{course.level}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{course.moduleCount} modules · {course.lessonCount} lessons</span>
                {course.totalMinutes > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                    <Clock size={12} /> {formatMinutes(course.totalMinutes)}
                  </span>
                )}
              </div>
              {course.subtitle && <p className="text-lg text-slate-700">{course.subtitle}</p>}
              {course.description && <div className="whitespace-pre-line leading-relaxed text-slate-600">{course.description}</div>}

              {course.instructorName && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-violet-100">
                    {course.instructorPhotoUrl ? (
                      <img src={course.instructorPhotoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-violet-700">{course.instructorName.slice(0, 1)}</div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Instructor</p>
                    <p className="font-semibold text-slate-900">{course.instructorName}</p>
                    {course.instructorTitle && <p className="text-sm text-slate-600">{course.instructorTitle}</p>}
                  </div>
                </div>
              )}

              {course.locked ? (
                <LockedCard reason={course.lockReason} token={token} />
              ) : lessons.length > 0 ? (
                <Button size="lg" disabled={busy} onClick={startCourse} className="bg-violet-600 hover:bg-violet-700">
                  {busy && <Loader2 size={16} className="mr-2 animate-spin" />}
                  {!token ? "Log in to start" : enrollment ? (progress?.percent === 100 ? "Review course" : "Continue learning") : "Start course"}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              ) : (
                <p className="text-sm text-slate-500">Lessons are being added. Check back soon.</p>
              )}
              <div className="lg:hidden">{outline}</div>
            </div>
          )}
        </main>
      </div>

      <Sheet open={tutorOpen} onOpenChange={setTutorOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2"><Bot size={18} className="text-violet-600" /> AI tutor</SheetTitle>
            <p className="text-xs text-slate-500">{current ? `About: ${current.title}` : `About: ${course.title}`}</p>
          </SheetHeader>
          <div className="mt-3 min-h-0 flex-1">
            <AssistantChat
              key={current?._id || "course"}
              compact
              thread={tutorThread && tutorThread.lessonId === (current?._id || "") ? tutorThread : null}
              onThread={setTutorThread}
              courseSlug={course.slug}
              lessonId={current?._id || ""}
              suggestions={["Summarise this lesson in 5 bullets", "Give me a real-world example", "Quiz me on this"]}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={outlineOpen} onOpenChange={setOutlineOpen}>
        <SheetContent side="left" className="w-[320px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Course outline</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{outline}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LearnCourse;
