import mongoose from "mongoose";

const { Schema } = mongoose;

export const LESSON_TYPES = ["video", "reading", "live", "quiz", "assignment", "resource"];
export const ACCESS_LEVELS = ["public", "members", "cohort"];

const ResourceSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const QuizQuestionSchema = new Schema({
  question: { type: String, required: true, trim: true },
  options: { type: [String], default: [] },
  correctIndex: { type: Number, default: 0 },
  explanation: { type: String, default: "", trim: true },
});

const LessonSchema = new Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: LESSON_TYPES, default: "video" },
  summary: { type: String, default: "", trim: true },
  durationMinutes: { type: Number, default: 0 },
  // Free preview lessons are viewable by anyone, even if the course itself is gated.
  isPreview: { type: Boolean, default: false },
  videoUrl: { type: String, default: "", trim: true },
  content: { type: String, default: "" },
  resources: { type: [ResourceSchema], default: [] },
  liveAt: { type: Date, default: null },
  liveUrl: { type: String, default: "", trim: true },
  quizPassPercent: { type: Number, default: 70, min: 0, max: 100 },
  quizQuestions: { type: [QuizQuestionSchema], default: [] },
  assignmentInstructions: { type: String, default: "" },
});

const ModuleSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  lessons: { type: [LessonSchema], default: [] },
});

const CourseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    coverImageUrl: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true },
    level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    tags: { type: [String], default: [] },
    instructorName: { type: String, default: "", trim: true },
    instructorTitle: { type: String, default: "", trim: true },
    instructorPhotoUrl: { type: String, default: "", trim: true },
    access: { type: String, enum: ACCESS_LEVELS, default: "members", index: true },
    // For access === "cohort": founders with an *accepted* application to any of these cohorts.
    cohortSlugs: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    modules: { type: [ModuleSchema], default: [] },
  },
  { timestamps: true, collection: "lms_courses" },
);

const QuizAttemptSchema = new Schema(
  {
    lessonId: { type: String, required: true },
    scorePercent: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    answers: { type: [Number], default: [] },
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const EnrollmentSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    fullName: { type: String, default: "", trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    courseSlug: { type: String, required: true, trim: true },
    completedLessonIds: { type: [String], default: [] },
    lastLessonId: { type: String, default: "" },
    quizAttempts: { type: [QuizAttemptSchema], default: [] },
    completedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: "lms_enrollments" },
);
EnrollmentSchema.index({ accountId: 1, courseId: 1 }, { unique: true });

const AssignmentSubmissionSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    fullName: { type: String, default: "", trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    courseSlug: { type: String, required: true, trim: true },
    courseTitle: { type: String, default: "", trim: true },
    lessonId: { type: String, required: true },
    lessonTitle: { type: String, default: "", trim: true },
    text: { type: String, default: "" },
    linkUrl: { type: String, default: "", trim: true },
    status: { type: String, enum: ["submitted", "reviewed", "needs-revision"], default: "submitted", index: true },
    feedback: { type: String, default: "" },
    grade: { type: String, default: "", trim: true },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "lms_assignment_submissions" },
);
AssignmentSubmissionSchema.index({ accountId: 1, courseId: 1, lessonId: 1 }, { unique: true });

const LiveSessionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    hostName: { type: String, default: "", trim: true },
    hostTitle: { type: String, default: "", trim: true },
    startsAt: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 60 },
    joinUrl: { type: String, default: "", trim: true },
    recordingUrl: { type: String, default: "", trim: true },
    coverImageUrl: { type: String, default: "", trim: true },
    access: { type: String, enum: ACCESS_LEVELS, default: "members" },
    cohortSlugs: { type: [String], default: [] },
    courseSlug: { type: String, default: "", trim: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: "lms_live_sessions" },
);

export const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);
export const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", EnrollmentSchema);
export const AssignmentSubmission =
  mongoose.models.AssignmentSubmission || mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
export const LiveSession = mongoose.models.LiveSession || mongoose.model("LiveSession", LiveSessionSchema);
