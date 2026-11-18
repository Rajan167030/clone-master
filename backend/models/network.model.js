import mongoose from "mongoose";

const { Schema } = mongoose;

export const LOOKING_FOR = ["cofounder", "mentors", "investors", "customers", "hires", "partners", "feedback"];
export const COFOUNDER_ROLES = ["tech", "product", "business", "sales", "marketing", "design", "operations", "finance"];
export const STARTUP_STAGES = ["idea", "mvp", "early_revenue", "growth", "scaling"];

/* ------------------------------------------------------------------ */
/* Founder profile + startup (one per account)                          */
/* ------------------------------------------------------------------ */

const FounderProfileSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    // Founder
    bio: { type: String, default: "", trim: true },
    role: { type: String, default: "", trim: true }, // e.g. "CEO & Co-founder"
    skills: { type: [String], default: [] },
    linkedinUrl: { type: String, default: "", trim: true },
    // Startup
    startupName: { type: String, default: "", trim: true, index: true },
    logoUrl: { type: String, default: "", trim: true },
    oneLiner: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    website: { type: String, default: "", trim: true },
    sectors: { type: [String], default: [], index: true },
    stage: { type: String, enum: [...STARTUP_STAGES, ""], default: "", index: true },
    businessModel: { type: String, enum: ["b2b", "b2c", "b2b2c", "d2c", "marketplace", "other", ""], default: "" },
    city: { type: String, default: "", trim: true, index: true },
    teamSize: { type: Number, default: 1 },
    foundedYear: { type: Number, default: null },
    fundingStatus: { type: String, enum: ["bootstrapped", "angel", "pre_seed", "seed", "series_a_plus", ""], default: "" },
    lookingFor: { type: [String], enum: LOOKING_FOR, default: [], index: true },
    // Co-founder discovery
    cofounder: {
      isLooking: { type: Boolean, default: false, index: true },
      myRole: { type: String, enum: [...COFOUNDER_ROLES, ""], default: "" },
      rolesWanted: { type: [String], enum: COFOUNDER_ROLES, default: [] },
      commitment: { type: String, enum: ["full_time", "part_time", "flexible", ""], default: "" },
      remoteOk: { type: Boolean, default: true },
      equity: { type: String, default: "", trim: true },
      pitch: { type: String, default: "", trim: true },
    },
    isListed: { type: Boolean, default: true, index: true }, // show in the startup directory
    savedOpportunityIds: { type: [{ type: Schema.Types.ObjectId, ref: "Opportunity" }], default: [] },
  },
  { timestamps: true, collection: "founder_profiles" },
);
FounderProfileSchema.index({ startupName: "text", oneLiner: "text", description: "text", skills: "text" });

/* ------------------------------------------------------------------ */
/* Founder-to-founder connections                                      */
/* ------------------------------------------------------------------ */

const ConnectionSchema = new Schema(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    // Sorted pair key so A→B and B→A can't both exist.
    pairKey: { type: String, required: true, unique: true },
    intent: { type: String, enum: ["network", "cofounder", "collaboration"], default: "network" },
    note: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending", index: true },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "network_connections" },
);

/* ------------------------------------------------------------------ */
/* Groups & peer circles                                                */
/* ------------------------------------------------------------------ */

const GroupSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    kind: { type: String, enum: ["group", "circle"], default: "group", index: true },
    category: { type: String, enum: ["sector", "city", "stage", "topic", "cohort"], default: "topic" },
    tags: { type: [String], default: [] },
    coverImageUrl: { type: String, default: "", trim: true },
    // open: anyone joins instantly · private: owner/moderators approve requests
    privacy: { type: String, enum: ["open", "private"], default: "open" },
    maxMembers: { type: Number, default: 0 }, // 0 = unlimited (circles are usually 6–12)
    meetingCadence: { type: String, default: "", trim: true }, // e.g. "Every other Thursday, 7pm"
    nextMeetingAt: { type: Date, default: null },
    meetingUrl: { type: String, default: "", trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    memberCount: { type: Number, default: 1 },
    isFeatured: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, collection: "community_groups" },
);

const GroupMembershipSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    role: { type: String, enum: ["owner", "moderator", "member"], default: "member" },
    status: { type: String, enum: ["active", "pending"], default: "active", index: true },
    requestNote: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "community_group_members" },
);
GroupMembershipSchema.index({ groupId: 1, accountId: 1 }, { unique: true });

const GroupCommentSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const GroupPostSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    content: { type: String, required: true, trim: true, maxlength: 3000 },
    isPinned: { type: Boolean, default: false },
    likes: { type: [{ type: Schema.Types.ObjectId, ref: "Account" }], default: [] },
    comments: { type: [GroupCommentSchema], default: [] },
  },
  { timestamps: true, collection: "community_group_posts" },
);
GroupPostSchema.index({ groupId: 1, isPinned: -1, createdAt: -1 });

/* ------------------------------------------------------------------ */
/* Collaboration board                                                  */
/* ------------------------------------------------------------------ */

export const COLLAB_TYPES = ["cofounder", "collaboration", "hiring", "partnership", "feedback", "freelance"];

const CollabPostSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    type: { type: String, enum: COLLAB_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    skills: { type: [String], default: [] },
    commitment: { type: String, enum: ["full_time", "part_time", "one_off", "flexible", ""], default: "" },
    location: { type: String, default: "", trim: true },
    remoteOk: { type: Boolean, default: true },
    compensation: { type: String, default: "", trim: true },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    interestCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "collab_posts" },
);

const CollabInterestSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "CollabPost", required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    message: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "collab_interests" },
);
CollabInterestSchema.index({ postId: 1, accountId: 1 }, { unique: true });

/* ------------------------------------------------------------------ */
/* Opportunities: grants, competitions, accelerators…                  */
/* ------------------------------------------------------------------ */

export const OPPORTUNITY_TYPES = ["grant", "competition", "accelerator", "fellowship", "credits", "pitch_event", "program", "other"];

const OpportunitySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: OPPORTUNITY_TYPES, default: "other", index: true },
    organizer: { type: String, default: "", trim: true },
    summary: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    eligibility: { type: String, default: "" },
    benefits: { type: String, default: "", trim: true }, // e.g. "₹10L grant + mentorship"
    deadline: { type: Date, default: null, index: true },
    startsAt: { type: Date, default: null },
    location: { type: String, default: "", trim: true },
    isOnline: { type: Boolean, default: true },
    applyUrl: { type: String, default: "", trim: true },
    logoUrl: { type: String, default: "", trim: true },
    sectors: { type: [String], default: [] },
    stages: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false, index: true },
    // Members can suggest; admins approve before it's public.
    status: { type: String, enum: ["published", "pending", "rejected"], default: "published", index: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: "Account", default: null },
    saveCount: { type: Number, default: 0 },
  },
  { timestamps: true, collection: "opportunities" },
);

export const FounderProfile = mongoose.models.FounderProfile || mongoose.model("FounderProfile", FounderProfileSchema);
export const Connection = mongoose.models.Connection || mongoose.model("Connection", ConnectionSchema);
export const Group = mongoose.models.Group || mongoose.model("Group", GroupSchema);
export const GroupMembership = mongoose.models.GroupMembership || mongoose.model("GroupMembership", GroupMembershipSchema);
export const GroupPost = mongoose.models.GroupPost || mongoose.model("GroupPost", GroupPostSchema);
export const CollabPost = mongoose.models.CollabPost || mongoose.model("CollabPost", CollabPostSchema);
export const CollabInterest = mongoose.models.CollabInterest || mongoose.model("CollabInterest", CollabInterestSchema);
export const Opportunity = mongoose.models.Opportunity || mongoose.model("Opportunity", OpportunitySchema);
