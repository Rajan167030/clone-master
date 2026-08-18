import express from "express";
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/team.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.route("/").get(getTeamMembers).post(requireAuth, requireAdmin, createTeamMember);
router
  .route("/:id")
  .put(requireAuth, requireAdmin, updateTeamMember)
  .patch(requireAuth, requireAdmin, updateTeamMember)
  .delete(requireAuth, requireAdmin, deleteTeamMember);

export default router;

