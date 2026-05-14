import TeamMember from "../models/team.model.js";
import asyncHandler from "express-async-handler";

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
const getTeamMembers = asyncHandler(async (req, res) => {
  const teamMembers = await TeamMember.find({}).sort({ order: 1 });
  res.json(teamMembers);
});

// @desc    Create a team member
// @route   POST /api/team
// @access  Private/Admin
const createTeamMember = asyncHandler(async (req, res) => {
  const { name, role, imageUrl, order } = req.body;

  const teamMember = new TeamMember({
    name,
    role,
    imageUrl,
    order,
  });

  const createdTeamMember = await teamMember.save();
  res.status(201).json(createdTeamMember);
});

// @desc    Update a team member
// @route   PUT /api/team/:id
// @access  Private/Admin
const updateTeamMember = asyncHandler(async (req, res) => {
  const { name, role, imageUrl, order } = req.body;

  const teamMember = await TeamMember.findById(req.params.id);

  if (teamMember) {
    teamMember.name = name || teamMember.name;
    teamMember.role = role || teamMember.role;
    teamMember.imageUrl = imageUrl || teamMember.imageUrl;
    teamMember.order = order !== undefined ? order : teamMember.order;

    const updatedTeamMember = await teamMember.save();
    res.json(updatedTeamMember);
  } else {
    res.status(404);
    throw new Error("Team member not found");
  }
});

// @desc    Delete a team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
const deleteTeamMember = asyncHandler(async (req, res) => {
  const teamMember = await TeamMember.findById(req.params.id);

  if (teamMember) {
    await teamMember.remove();
    res.json({ message: "Team member removed" });
  } else {
    res.status(404);
    throw new Error("Team member not found");
  }
});

export {
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};
