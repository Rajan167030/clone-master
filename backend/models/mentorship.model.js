import mongoose from "mongoose";

const { Schema } = mongoose;

// Invite-only mentor onboarding: an admin issues a single-use link; whoever opens it
// can submit a mentor application, which an admin then approves or rejects.
const MentorInviteSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    label: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, default: null },
    usedAt: { type: Date, default: null },
    applicationId: { type: Schema.Types.ObjectId, ref: "MentorApplication", default: null },
  },
  { timestamps: true, collection: "mentor_invites" },
);

const MentorApplicationSchema = new Schema(
  {
    inviteId: { type: Schema.Types.ObjectId, ref: "MentorInvite", default: null, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: "", trim: true },
    designation: { type: String, required: true, trim: true },
    company: { type: String, default: "", trim: true },
    linkedinUrl: { type: String, default: "", trim: true },
    websiteUrl: { type: String, default: "", trim: true },
    photoUrl: { type: String, default: "", trim: true },
    bio: { type: String, required: true, trim: true },
    expertise: { type: [String], default: [] },
    industries: { type: [String], default: [] },
    yearsOfExperience: { type: Number, default: 0 },
    availability: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNotes: { type: String, default: "", trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    reviewedAt: { type: Date, default: null },
    // Set once approved: the public SpeakerInvestorProfile (category "mentor") created from this.
    profileId: { type: Schema.Types.ObjectId, ref: "SpeakerInvestorProfile", default: null },
  },
  { timestamps: true, collection: "mentor_applications" },
);

const MentorConnectRequestSchema = new Schema(
  {
    mentorProfileId: { type: Schema.Types.ObjectId, ref: "SpeakerInvestorProfile", required: true, index: true },
    mentorSlug: { type: String, required: true, trim: true, index: true },
    mentorName: { type: String, default: "", trim: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    startupName: { type: String, default: "", trim: true },
    stage: { type: String, default: "", trim: true },
    topic: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    preferredMode: { type: String, enum: ["video", "in-person", "chat", "any"], default: "any" },
    status: {
      type: String,
      enum: ["new", "forwarded", "scheduled", "completed", "declined"],
      default: "new",
      index: true,
    },
    adminNotes: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "mentor_connect_requests" },
);

export const MentorInvite =
  mongoose.models.MentorInvite || mongoose.model("MentorInvite", MentorInviteSchema);
export const MentorApplication =
  mongoose.models.MentorApplication || mongoose.model("MentorApplication", MentorApplicationSchema);
export const MentorConnectRequest =
  mongoose.models.MentorConnectRequest || mongoose.model("MentorConnectRequest", MentorConnectRequestSchema);
