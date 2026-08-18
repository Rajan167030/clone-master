import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  linkedinUrl: {
    type: String,
    default: "",
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

export default TeamMember;

