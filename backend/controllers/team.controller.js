import TeamMember from "../models/team.model.js";
import asyncHandler from "express-async-handler";

// @desc    Get all active team members (Public)
// @route   GET /api/team or GET /api/content/team
// @access  Public
const getTeamMembers = asyncHandler(async (req, res) => {
  const teamMembers = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
  res.json({ members: teamMembers });
});

// @desc    Get all team members for admin (Admin)
// @route   GET /api/admin/team
// @access  Private/Admin
const getAdminTeamMembers = asyncHandler(async (req, res) => {
  const teamMembers = await TeamMember.find({}).sort({ order: 1, createdAt: -1 }).lean();
  res.json({ members: teamMembers });
});

// @desc    Create a team member
// @route   POST /api/team or POST /api/admin/team
// @access  Private/Admin
const createTeamMember = asyncHandler(async (req, res) => {
  const { name, role, imageUrl, linkedinUrl, order, isActive } = req.body;

  if (!name || !role || !imageUrl) {
    res.status(400);
    throw new Error("Name, role, and imageUrl are required.");
  }

  const teamMember = new TeamMember({
    name: String(name).trim(),
    role: String(role).trim(),
    imageUrl: String(imageUrl).trim(),
    linkedinUrl: String(linkedinUrl || "").trim(),
    order: Number(order || 0),
    isActive: typeof isActive === "boolean" ? isActive : true,
  });

  const createdTeamMember = await teamMember.save();
  res.status(201).json({ message: "Team member created successfully.", member: createdTeamMember });
});

// @desc    Update a team member
// @route   PUT/PATCH /api/team/:id or /api/admin/team/:id
// @access  Private/Admin
const updateTeamMember = asyncHandler(async (req, res) => {
  const { name, role, imageUrl, linkedinUrl, order, isActive } = req.body;

  const teamMember = await TeamMember.findById(req.params.id);

  if (teamMember) {
    if (name !== undefined) teamMember.name = String(name).trim();
    if (role !== undefined) teamMember.role = String(role).trim();
    if (imageUrl !== undefined) teamMember.imageUrl = String(imageUrl).trim();
    if (linkedinUrl !== undefined) teamMember.linkedinUrl = String(linkedinUrl).trim();
    if (order !== undefined) teamMember.order = Number(order);
    if (isActive !== undefined) teamMember.isActive = Boolean(isActive);

    const updatedTeamMember = await teamMember.save();
    res.json({ message: "Team member updated successfully.", member: updatedTeamMember });
  } else {
    res.status(404);
    throw new Error("Team member not found");
  }
});

// @desc    Delete a team member
// @route   DELETE /api/team/:id or /api/admin/team/:id
// @access  Private/Admin
const deleteTeamMember = asyncHandler(async (req, res) => {
  const teamMember = await TeamMember.findById(req.params.id);

  if (teamMember) {
    await TeamMember.deleteOne({ _id: req.params.id });
    res.json({ message: "Team member removed successfully." });
  } else {
    res.status(404);
    throw new Error("Team member not found");
  }
});

export {
  getTeamMembers,
  getAdminTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
};

