import { Router } from "express";
import {
  listCourses,
  getCourse,
  enrollCourse,
  setLessonComplete,
  submitQuiz,
  submitAssignment,
  listLiveSessions,
  getLibrary,
  getMyLearning,
  adminListCourses,
  adminGetCourse,
  adminCreateCourse,
  adminUpdateCourse,
  adminDeleteCourse,
  adminCourseLearners,
  adminListLiveSessions,
  adminCreateLiveSession,
  adminUpdateLiveSession,
  adminDeleteLiveSession,
  adminListSubmissions,
  adminReviewSubmission,
  adminLearningStats,
} from "../controllers/lms.controller.js";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { auditLogger } from "../middlewares/audit.middleware.js";

const router = Router();

// Catalog & content (anonymous allowed; gated content unlocks with a valid token)
router.get("/courses", optionalAuth, listCourses);
router.get("/courses/:slug", optionalAuth, getCourse);
router.get("/live-sessions", optionalAuth, listLiveSessions);
router.get("/library", optionalAuth, getLibrary);

// Learner actions
router.get("/me", requireAuth, getMyLearning);
router.post("/courses/:slug/enroll", requireAuth, enrollCourse);
router.post("/courses/:slug/lessons/:lessonId/complete", requireAuth, setLessonComplete);
router.delete("/courses/:slug/lessons/:lessonId/complete", requireAuth, setLessonComplete);
router.post("/courses/:slug/lessons/:lessonId/quiz", requireAuth, submitQuiz);
router.post("/courses/:slug/lessons/:lessonId/assignment", requireAuth, submitAssignment);

// Admin
const admin = Router();
admin.use(requireAuth, requireAdmin, auditLogger);
admin.get("/stats", adminLearningStats);
admin.get("/courses", adminListCourses);
admin.post("/courses", adminCreateCourse);
admin.get("/courses/:id", adminGetCourse);
admin.put("/courses/:id", adminUpdateCourse);
admin.delete("/courses/:id", adminDeleteCourse);
admin.get("/courses/:id/learners", adminCourseLearners);
admin.get("/live-sessions", adminListLiveSessions);
admin.post("/live-sessions", adminCreateLiveSession);
admin.put("/live-sessions/:id", adminUpdateLiveSession);
admin.delete("/live-sessions/:id", adminDeleteLiveSession);
admin.get("/submissions", adminListSubmissions);
admin.patch("/submissions/:id", adminReviewSubmission);
router.use("/admin", admin);

export default router;
