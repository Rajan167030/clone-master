import express from "express";
import {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from "../controllers/team.controller.js";
import { protect, admin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/").get(getTeamMembers).post(protect, admin, createTeamMember);
router
  .route("/:id")
  .put(protect, admin, updateTeamMember)
  .delete(protect, admin, deleteTeamMember);

export default router;
