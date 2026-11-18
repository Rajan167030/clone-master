import mongoose from "mongoose";
import { Opportunity, FounderProfile } from "../models/index.js";
import { OPPORTUNITY_TYPES } from "../models/network.model.js";
import { handle, httpError, str, strList, pickEnum, isHttpUrl, escapeRegex, meId, isAdminUser, uniqueSlug, ensureProfile } from "../utils/network-helpers.js";

const toDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const sanitize = (b = {}) => {
  const data = {
    title: str(b.title, 160),
    type: pickEnum(b.type, OPPORTUNITY_TYPES, "other"),
    organizer: str(b.organizer, 120),
    summary: str(b.summary, 300),
    description: str(b.description, 10000),
    eligibility: str(b.eligibility, 5000),
    benefits: str(b.benefits, 200),
    deadline: toDate(b.deadline),
    startsAt: toDate(b.startsAt),
    location: str(b.location, 100),
    isOnline: b.isOnline !== false,
    applyUrl: str(b.applyUrl, 500),
    logoUrl: str(b.logoUrl, 500),
    sectors: strList(b.sectors, 8),
    stages: strList(b.stages, 6),
    tags: strList(b.tags, 8),
  };
  if (data.title.length < 4) throw httpError(400, "A title is required.");
  if (!data.applyUrl) throw httpError(400, "An application or info link is required.");
  if (![data.applyUrl, data.logoUrl].every(isHttpUrl)) throw httpError(400, "Links must start with http:// or https://");
  return data;
};

const oppJSON = (o, savedSet) => {
  const now = Date.now();
  const deadline = o.deadline ? new Date(o.deadline).getTime() : null;
  return {
    _id: o._id,
    slug: o.slug,
    title: o.title,
    type: o.type,
    organizer: o.organizer,
    summary: o.summary,
    description: o.description,
    eligibility: o.eligibility,
    benefits: o.benefits,
    deadline: o.deadline,
    startsAt: o.startsAt,
    location: o.location,
    isOnline: o.isOnline,
    applyUrl: o.applyUrl,
    logoUrl: o.logoUrl,
    sectors: o.sectors,
    stages: o.stages,
    tags: o.tags,
    isFeatured: o.isFeatured,
    status: o.status,
    saveCount: o.saveCount,
    isClosed: deadline !== null && deadline < now,
    closingSoon: deadline !== null && deadline >= now && deadline - now < 7 * 86400000,
    savedByMe: savedSet ? savedSet.has(String(o._id)) : false,
    createdAt: o.createdAt,
  };
};

const savedSetFor = async (req) => {
  const id = meId(req);
  if (!id) return new Set();
  const p = await FounderProfile.findOne({ accountId: id }).select("savedOpportunityIds").lean();
  return new Set((p?.savedOpportunityIds || []).map(String));
};

export const listOpportunities = handle(async (req, res) => {
  const q = req.query;
  const filter = { status: "published" };
  if (OPPORTUNITY_TYPES.includes(q.type)) filter.type = q.type;
  if (q.sector) filter.sectors = new RegExp(`^${escapeRegex(str(q.sector, 40))}$`, "i");
  if (q.stage) filter.stages = new RegExp(`^${escapeRegex(str(q.stage, 40))}$`, "i");
  if (q.search) {
    const rx = new RegExp(escapeRegex(str(q.search, 80)), "i");
    filter.$or = [{ title: rx }, { organizer: rx }, { summary: rx }, { tags: rx }];
  }
  if (q.show !== "all") filter.$and = [{ $or: [{ deadline: null }, { deadline: { $gte: new Date() } }] }];
  const saved = await savedSetFor(req);
  if (q.saved === "1") filter._id = { $in: [...saved] };

  const items = await Opportunity.find(filter).limit(300).lean();
  // Featured first, then soonest deadline, rolling (no deadline) last.
  items.sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const dbb = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    return da - dbb || new Date(b.createdAt) - new Date(a.createdAt);
  });
  res.status(200).json({ opportunities: items.map((o) => oppJSON(o, saved)) });
});

export const getOpportunity = handle(async (req, res) => {
  const o = await Opportunity.findOne({ slug: str(req.params.slug, 100) }).lean();
  const own = o && String(o.submittedBy) === meId(req);
  if (!o || (o.status !== "published" && !own && !isAdminUser(req))) throw httpError(404, "Opportunity not found.");
  res.status(200).json({ opportunity: oppJSON(o, await savedSetFor(req)) });
});

export const toggleSaveOpportunity = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Opportunity not found.");
  const o = await Opportunity.findOne({ _id: req.params.id, status: "published" }).select("_id").lean();
  if (!o) throw httpError(404, "Opportunity not found.");
  const profile = await ensureProfile(meId(req));
  const saved = profile.savedOpportunityIds.some((id) => String(id) === String(o._id));
  await FounderProfile.updateOne({ _id: profile._id }, saved ? { $pull: { savedOpportunityIds: o._id } } : { $addToSet: { savedOpportunityIds: o._id } });
  await Opportunity.updateOne({ _id: o._id, ...(saved ? { saveCount: { $gt: 0 } } : {}) }, { $inc: { saveCount: saved ? -1 : 1 } });
  res.status(200).json({ savedByMe: !saved });
});

export const suggestOpportunity = handle(async (req, res) => {
  const pending = await Opportunity.countDocuments({ submittedBy: meId(req), status: "pending" });
  if (pending >= 5) throw httpError(429, "You have 5 suggestions awaiting review.");
  const data = sanitize(req.body);
  const o = await Opportunity.create({ ...data, slug: await uniqueSlug(Opportunity, data.title, "opportunity"), status: "pending", submittedBy: meId(req) });
  res.status(201).json({ message: "Thanks! Our team will review it before it goes live.", opportunity: oppJSON(o.toObject()) });
});

/* ---------- admin ---------- */

export const adminListOpportunities = handle(async (req, res) => {
  const filter = ["published", "pending", "rejected"].includes(req.query.status) ? { status: req.query.status } : {};
  const items = await Opportunity.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  res.status(200).json({ opportunities: items.map((o) => oppJSON(o)) });
});

export const adminCreateOpportunity = handle(async (req, res) => {
  const data = sanitize(req.body);
  const o = await Opportunity.create({
    ...data,
    slug: await uniqueSlug(Opportunity, data.title, "opportunity"),
    isFeatured: Boolean(req.body?.isFeatured),
    status: "published",
    submittedBy: meId(req),
  });
  res.status(201).json({ opportunity: oppJSON(o.toObject()) });
});

export const adminUpdateOpportunity = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Opportunity not found.");
  const o = await Opportunity.findById(req.params.id);
  if (!o) throw httpError(404, "Opportunity not found.");
  if (req.body?.status && Object.keys(req.body).length <= 2 && !req.body.title) {
    // Quick moderation: {status} or {status, isFeatured}
    o.status = pickEnum(req.body.status, ["published", "pending", "rejected"], o.status);
    if (req.body.isFeatured !== undefined) o.isFeatured = Boolean(req.body.isFeatured);
  } else {
    o.set(sanitize(req.body));
    if (req.body?.isFeatured !== undefined) o.isFeatured = Boolean(req.body.isFeatured);
    if (req.body?.status) o.status = pickEnum(req.body.status, ["published", "pending", "rejected"], o.status);
  }
  await o.save();
  res.status(200).json({ opportunity: oppJSON(o.toObject()) });
});

export const adminDeleteOpportunity = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Opportunity not found.");
  const o = await Opportunity.findByIdAndDelete(req.params.id);
  if (!o) throw httpError(404, "Opportunity not found.");
  await FounderProfile.updateMany({ savedOpportunityIds: o._id }, { $pull: { savedOpportunityIds: o._id } });
  res.status(200).json({ message: "Deleted." });
});
