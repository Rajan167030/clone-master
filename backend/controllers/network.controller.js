import mongoose from "mongoose";
import {
  Account,
  FounderProfile,
  Connection,
  CollabPost,
  CollabInterest,
  CommunityMessage,
  Group,
  GroupMembership,
  Opportunity,
} from "../models/index.js";
import { LOOKING_FOR, COFOUNDER_ROLES, STARTUP_STAGES, COLLAB_TYPES } from "../models/network.model.js";
import { sendEmail } from "../utils/email.js";
import {
  handle,
  httpError,
  str,
  strList,
  pickEnum,
  pickEnumList,
  isHttpUrl,
  escapeRegex,
  meId,
  isAdminUser,
  uniqueSlug,
  ensureProfile,
  loadPeople,
  unknownPerson,
} from "../utils/network-helpers.js";

const FRONTEND_URL = () => (process.env.FRONTEND_URL || process.env.HOST_URL || "https://foundersconnect.co.in").replace(/\/+$/, "");
const escapeHtml = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const pairKey = (a, b) => [String(a), String(b)].sort().join(":");

const notify = async (accountId, subject, title, body, cta) => {
  const account = await Account.findById(accountId).select("email notificationPrefs").lean();
  if (!account?.email || account.notificationPrefs?.communityActivity === false) return;
  sendEmail({
    to: account.email,
    subject,
    html: `<div style="background:#f5f3ff;padding:32px 16px;font-family:Arial,sans-serif"><div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e9e5f7;border-radius:14px;overflow:hidden"><div style="height:4px;background:#7c3aed"></div><div style="padding:28px"><p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;font-weight:700">Founders Connect · Network</p><h1 style="margin:0 0 14px;font-size:20px;color:#1e1b2e">${title}</h1><div style="font-size:14px;line-height:1.6;color:#4b4763">${body}</div>${cta ? `<p style="margin:22px 0 0"><a href="${cta.href}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600;font-size:14px">${cta.label}</a></p>` : ""}</div></div></div>`,
  }).catch(() => {});
};

/* ------------------------------------------------------------------ */
/* Founder profile                                                     */
/* ------------------------------------------------------------------ */

const profileJSON = (p) => ({
  _id: p._id,
  accountId: String(p.accountId),
  slug: p.slug,
  bio: p.bio,
  role: p.role,
  skills: p.skills,
  linkedinUrl: p.linkedinUrl,
  startupName: p.startupName,
  logoUrl: p.logoUrl,
  oneLiner: p.oneLiner,
  description: p.description,
  website: p.website,
  sectors: p.sectors,
  stage: p.stage,
  businessModel: p.businessModel,
  city: p.city,
  teamSize: p.teamSize,
  foundedYear: p.foundedYear,
  fundingStatus: p.fundingStatus,
  lookingFor: p.lookingFor,
  cofounder: p.cofounder,
  isListed: p.isListed,
  updatedAt: p.updatedAt,
});

export const getMyProfile = handle(async (req, res) => {
  const profile = await ensureProfile(meId(req));
  res.status(200).json({ profile: profileJSON(profile) });
});

export const updateMyProfile = handle(async (req, res) => {
  const b = req.body || {};
  const profile = await ensureProfile(meId(req));
  const urls = [str(b.logoUrl, 500), str(b.website, 300), str(b.linkedinUrl, 300)];
  if (!urls.every(isHttpUrl)) throw httpError(400, "Links must start with http:// or https://");
  const year = Number(b.foundedYear);

  profile.set({
    bio: str(b.bio, 1500),
    role: str(b.role, 100),
    skills: strList(b.skills, 15),
    linkedinUrl: urls[2],
    startupName: str(b.startupName, 120),
    logoUrl: urls[0],
    oneLiner: str(b.oneLiner, 200),
    description: str(b.description, 5000),
    website: urls[1],
    sectors: strList(b.sectors, 5),
    stage: pickEnum(b.stage, STARTUP_STAGES),
    businessModel: pickEnum(b.businessModel, ["b2b", "b2c", "b2b2c", "d2c", "marketplace", "other"]),
    city: str(b.city, 80),
    teamSize: Math.max(1, Math.min(100000, Number(b.teamSize) || 1)),
    foundedYear: Number.isInteger(year) && year >= 1990 && year <= new Date().getFullYear() + 1 ? year : null,
    fundingStatus: pickEnum(b.fundingStatus, ["bootstrapped", "angel", "pre_seed", "seed", "series_a_plus"]),
    lookingFor: pickEnumList(b.lookingFor, LOOKING_FOR),
    isListed: Boolean(b.isListed),
    cofounder: {
      isLooking: Boolean(b.cofounder?.isLooking),
      myRole: pickEnum(b.cofounder?.myRole, COFOUNDER_ROLES),
      rolesWanted: pickEnumList(b.cofounder?.rolesWanted, COFOUNDER_ROLES),
      commitment: pickEnum(b.cofounder?.commitment, ["full_time", "part_time", "flexible"]),
      remoteOk: b.cofounder?.remoteOk !== false,
      equity: str(b.cofounder?.equity, 80),
      pitch: str(b.cofounder?.pitch, 1000),
    },
  });
  if (b.slug && str(b.slug, 70) !== profile.slug) profile.slug = await uniqueSlug(FounderProfile, b.slug, "founder", profile._id);
  if (profile.cofounder.isLooking && !profile.lookingFor.includes("cofounder")) profile.lookingFor.push("cofounder");
  if (profile.isListed && !profile.startupName) throw httpError(400, "Add your startup name to be listed in the directory.");
  await profile.save();
  res.status(200).json({ profile: profileJSON(profile) });
});

/* ------------------------------------------------------------------ */
/* Startup directory                                                   */
/* ------------------------------------------------------------------ */

const visibleAccountIds = async (ids) =>
  new Set((await Account.find({ _id: { $in: ids }, isActive: true, isProfilePublic: { $ne: false } }).select("_id").lean()).map((a) => String(a._id)));

export const listStartups = handle(async (req, res) => {
  const q = req.query;
  const filter = { isListed: true, startupName: { $ne: "" } };
  if (q.sector) filter.sectors = new RegExp(`^${escapeRegex(str(q.sector, 40))}$`, "i");
  if (STARTUP_STAGES.includes(q.stage)) filter.stage = q.stage;
  if (q.city) filter.city = new RegExp(escapeRegex(str(q.city, 60)), "i");
  if (LOOKING_FOR.includes(q.lookingFor)) filter.lookingFor = q.lookingFor;
  if (q.search) {
    const rx = new RegExp(escapeRegex(str(q.search, 80)), "i");
    filter.$or = [{ startupName: rx }, { oneLiner: rx }, { sectors: rx }, { skills: rx }];
  }
  const limit = Math.min(Number(q.limit) || 24, 60);
  const page = Math.max(Number(q.page) || 1, 1);

  const profiles = await FounderProfile.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit + 1).lean();
  const visible = await visibleAccountIds(profiles.map((p) => p.accountId));
  const people = await loadPeople(profiles.map((p) => p.accountId));
  const items = profiles.slice(0, limit).filter((p) => visible.has(String(p.accountId)));

  // Facets for the filter UI (cheap: computed over listed profiles).
  const facets = page === 1
    ? await FounderProfile.aggregate([
        { $match: { isListed: true, startupName: { $ne: "" } } },
        { $unwind: "$sectors" },
        { $group: { _id: "$sectors", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ])
    : [];

  res.status(200).json({
    startups: items.map((p) => ({
      slug: p.slug,
      startupName: p.startupName,
      logoUrl: p.logoUrl,
      oneLiner: p.oneLiner,
      sectors: p.sectors,
      stage: p.stage,
      city: p.city,
      teamSize: p.teamSize,
      lookingFor: p.lookingFor,
      founder: people.get(String(p.accountId)) || unknownPerson(p.accountId),
    })),
    hasMore: profiles.length > limit,
    sectors: facets.map((f) => f._id),
  });
});

const connectionStatus = async (viewerId, otherId) => {
  if (!viewerId) return { status: "none" };
  if (viewerId === String(otherId)) return { status: "self" };
  const c = await Connection.findOne({ pairKey: pairKey(viewerId, otherId) }).lean();
  if (!c || c.status === "declined") return { status: "none" };
  if (c.status === "accepted") return { status: "connected", connectionId: c._id };
  return { status: String(c.requesterId) === viewerId ? "outgoing" : "incoming", connectionId: c._id };
};

export const getStartup = handle(async (req, res) => {
  const profile = await FounderProfile.findOne({ slug: str(req.params.slug, 80) }).lean();
  if (!profile) throw httpError(404, "Startup not found.");
  const viewer = meId(req);
  const isOwner = viewer === String(profile.accountId);
  const visible = await visibleAccountIds([profile.accountId]);
  if (!isOwner && (!profile.isListed || !visible.has(String(profile.accountId)))) throw httpError(404, "Startup not found.");

  const [people, connection, collab, connectionsCount] = await Promise.all([
    loadPeople([profile.accountId]),
    connectionStatus(viewer, profile.accountId),
    CollabPost.find({ authorId: profile.accountId, status: "open" }).sort({ createdAt: -1 }).limit(5).lean(),
    Connection.countDocuments({ status: "accepted", $or: [{ requesterId: profile.accountId }, { recipientId: profile.accountId }] }),
  ]);
  res.status(200).json({
    startup: { ...profileJSON(profile), founder: people.get(String(profile.accountId)) || unknownPerson(profile.accountId), connectionsCount },
    connection,
    openCollabs: collab.map((c) => ({ _id: c._id, type: c.type, title: c.title, createdAt: c.createdAt })),
  });
});

/* ------------------------------------------------------------------ */
/* Connections                                                         */
/* ------------------------------------------------------------------ */

export const requestConnection = handle(async (req, res) => {
  const me = meId(req);
  const other = str(req.body?.recipientId, 40);
  if (!mongoose.isValidObjectId(other)) throw httpError(400, "Invalid member.");
  if (other === me) throw httpError(400, "You can't connect with yourself.");
  const recipient = await Account.findOne({ _id: other, isActive: true }).select("fullName").lean();
  if (!recipient) throw httpError(404, "Member not found.");

  const intent = pickEnum(req.body?.intent, ["network", "cofounder", "collaboration"], "network");
  const note = str(req.body?.note, 500);
  const key = pairKey(me, other);
  const existing = await Connection.findOne({ pairKey: key });

  if (existing?.status === "accepted") return res.status(200).json({ status: "connected", connectionId: existing._id });
  if (existing?.status === "pending") {
    // They already asked me → accept instead of creating a duplicate.
    if (String(existing.recipientId) === me) {
      existing.status = "accepted";
      existing.respondedAt = new Date();
      await existing.save();
      return res.status(200).json({ status: "connected", connectionId: existing._id });
    }
    return res.status(200).json({ status: "outgoing", connectionId: existing._id });
  }

  const pendingCount = await Connection.countDocuments({ requesterId: me, status: "pending" });
  if (pendingCount >= 50) throw httpError(429, "You have 50 pending requests. Wait for some replies before sending more.");

  let connection;
  if (existing) {
    // Re-request after a decline: only allowed after 30 days.
    if (existing.respondedAt && Date.now() - new Date(existing.respondedAt).getTime() < 30 * 86400000) {
      throw httpError(429, "This member declined recently. You can try again later.");
    }
    existing.set({ requesterId: me, recipientId: other, status: "pending", intent, note, respondedAt: null });
    connection = await existing.save();
  } else {
    connection = await Connection.create({ requesterId: me, recipientId: other, pairKey: key, intent, note });
  }

  const people = await loadPeople([me]);
  const sender = people.get(me);
  notify(
    other,
    `${sender?.fullName || "A founder"} wants to connect on Founders Connect`,
    `${escapeHtml(sender?.fullName || "A founder")} sent you a ${intent === "cofounder" ? "co-founder" : "connection"} request`,
    `${sender?.startupName ? `<p style="margin:0 0 10px">${escapeHtml(sender.startupName)}</p>` : ""}${note ? `<p style="margin:0;padding:12px;background:#f8f7fc;border-radius:8px;white-space:pre-wrap">${escapeHtml(note)}</p>` : ""}`,
    { href: `${FRONTEND_URL()}/network`, label: "Review request" },
  );
  res.status(201).json({ status: "outgoing", connectionId: connection._id });
});

export const listConnections = handle(async (req, res) => {
  const me = meId(req);
  const all = await Connection.find({ status: { $in: ["pending", "accepted"] }, $or: [{ requesterId: me }, { recipientId: me }] }).sort({ updatedAt: -1 }).lean();
  const otherOf = (c) => (String(c.requesterId) === me ? c.recipientId : c.requesterId);
  const people = await loadPeople(all.map(otherOf));
  const shape = (c) => ({ _id: c._id, intent: c.intent, note: c.note, createdAt: c.createdAt, person: people.get(String(otherOf(c))) || unknownPerson(otherOf(c)) });
  res.status(200).json({
    connections: all.filter((c) => c.status === "accepted").map(shape),
    incoming: all.filter((c) => c.status === "pending" && String(c.recipientId) === me).map(shape),
    outgoing: all.filter((c) => c.status === "pending" && String(c.requesterId) === me).map(shape),
  });
});

export const respondConnection = handle(async (req, res) => {
  const me = meId(req);
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Request not found.");
  const c = await Connection.findById(req.params.id);
  if (!c || String(c.recipientId) !== me || c.status !== "pending") throw httpError(404, "Request not found.");
  const action = req.body?.action;
  if (!["accept", "decline"].includes(action)) throw httpError(400, "Action must be accept or decline.");
  c.status = action === "accept" ? "accepted" : "declined";
  c.respondedAt = new Date();
  await c.save();
  if (action === "accept") {
    const people = await loadPeople([me]);
    notify(
      c.requesterId,
      `${people.get(me)?.fullName || "A founder"} accepted your request`,
      "You're now connected",
      `${escapeHtml(people.get(me)?.fullName || "A founder")} accepted your connection request. Say hello!`,
      { href: `${FRONTEND_URL()}/community/messages/${me}`, label: "Send a message" },
    );
  }
  res.status(200).json({ status: c.status });
});

export const removeConnection = handle(async (req, res) => {
  const me = meId(req);
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Connection not found.");
  const c = await Connection.findById(req.params.id);
  if (!c || (String(c.requesterId) !== me && String(c.recipientId) !== me)) throw httpError(404, "Connection not found.");
  await c.deleteOne();
  res.status(200).json({ message: "Removed." });
});

export const connectionWith = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.accountId)) throw httpError(400, "Invalid member.");
  res.status(200).json(await connectionStatus(meId(req), req.params.accountId));
});

/** People-you-may-know: overlap in sector, city, stage or complementary co-founder roles. */
export const suggestions = handle(async (req, res) => {
  const me = meId(req);
  const mine = await ensureProfile(me);
  const linked = await Connection.find({ $or: [{ requesterId: me }, { recipientId: me }], status: { $in: ["pending", "accepted"] } }).select("requesterId recipientId").lean();
  const exclude = new Set([me, ...linked.flatMap((c) => [String(c.requesterId), String(c.recipientId)])]);

  const candidates = await FounderProfile.find({
    accountId: { $nin: [...exclude] },
    isListed: true,
    $or: [
      ...(mine.sectors.length ? [{ sectors: { $in: mine.sectors } }] : []),
      ...(mine.city ? [{ city: new RegExp(`^${escapeRegex(mine.city)}$`, "i") }] : []),
      ...(mine.stage ? [{ stage: mine.stage }] : []),
      { "cofounder.isLooking": true },
    ],
  }).limit(80).lean();
  const visible = await visibleAccountIds(candidates.map((c) => c.accountId));

  const scored = candidates
    .filter((c) => visible.has(String(c.accountId)))
    .map((c) => {
      const reasons = [];
      const shared = c.sectors.filter((s) => mine.sectors.map((x) => x.toLowerCase()).includes(s.toLowerCase()));
      if (shared.length) reasons.push(`Also in ${shared[0]}`);
      if (mine.city && c.city && c.city.toLowerCase() === mine.city.toLowerCase()) reasons.push(`Based in ${c.city}`);
      if (mine.stage && c.stage === mine.stage) reasons.push("Same stage");
      if (mine.cofounder?.isLooking && c.cofounder?.isLooking && mine.cofounder.rolesWanted.includes(c.cofounder.myRole)) reasons.push(`${c.cofounder.myRole} co-founder`);
      return { c, score: shared.length * 3 + (reasons.length ? reasons.length : 0), reasons };
    })
    .filter((x) => x.reasons.length)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
  const people = await loadPeople(scored.map((x) => x.c.accountId));
  res.status(200).json({ suggestions: scored.map((x) => ({ person: people.get(String(x.c.accountId)), reasons: x.reasons })).filter((x) => x.person) });
});

/* ------------------------------------------------------------------ */
/* Co-founder discovery                                                */
/* ------------------------------------------------------------------ */

export const listCofounders = handle(async (req, res) => {
  const me = meId(req);
  const mine = await ensureProfile(me);
  const q = req.query;
  const filter = { "cofounder.isLooking": true, accountId: { $ne: mine.accountId } };
  if (COFOUNDER_ROLES.includes(q.role)) filter["cofounder.myRole"] = q.role;
  if (["full_time", "part_time", "flexible"].includes(q.commitment)) filter["cofounder.commitment"] = q.commitment;
  if (q.city) filter.city = new RegExp(escapeRegex(str(q.city, 60)), "i");
  if (q.sector) filter.sectors = new RegExp(`^${escapeRegex(str(q.sector, 40))}$`, "i");

  const profiles = await FounderProfile.find(filter).sort({ updatedAt: -1 }).limit(200).lean();
  const visible = await visibleAccountIds(profiles.map((p) => p.accountId));
  const wanted = mine.cofounder?.rolesWanted || [];
  const myRole = mine.cofounder?.myRole || "";

  const scored = profiles
    .filter((p) => visible.has(String(p.accountId)))
    .map((p) => {
      let score = 20;
      const why = [];
      if (wanted.includes(p.cofounder.myRole)) { score += 35; why.push(`They're ${p.cofounder.myRole}, which you're looking for`); }
      if (myRole && p.cofounder.rolesWanted.includes(myRole)) { score += 25; why.push(`They want a ${myRole} co-founder like you`); }
      const shared = p.sectors.filter((s) => mine.sectors.map((x) => x.toLowerCase()).includes(s.toLowerCase()));
      if (shared.length) { score += 10; why.push(`Both in ${shared[0]}`); }
      if (mine.city && p.city && p.city.toLowerCase() === mine.city.toLowerCase()) { score += 5; why.push(`Both in ${p.city}`); }
      else if (p.cofounder.remoteOk && mine.cofounder?.remoteOk !== false) score += 3;
      if (mine.cofounder?.commitment && mine.cofounder.commitment === p.cofounder.commitment) { score += 5; why.push("Same commitment"); }
      return { p, score: Math.min(100, score), why };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 60);

  const people = await loadPeople(scored.map((x) => x.p.accountId));
  res.status(200).json({
    myProfileComplete: Boolean(mine.cofounder?.isLooking && mine.cofounder.myRole),
    cofounders: scored.map(({ p, score, why }) => ({
      person: people.get(String(p.accountId)) || unknownPerson(p.accountId),
      startupSlug: p.slug,
      startupName: p.startupName,
      oneLiner: p.oneLiner,
      skills: p.skills,
      sectors: p.sectors,
      city: p.city,
      cofounder: p.cofounder,
      matchScore: score,
      matchReasons: why,
    })),
  });
});

/* ------------------------------------------------------------------ */
/* Collaboration board                                                 */
/* ------------------------------------------------------------------ */

const collabJSON = (c, people, viewer, interestedSet) => ({
  _id: c._id,
  type: c.type,
  title: c.title,
  description: c.description,
  skills: c.skills,
  commitment: c.commitment,
  location: c.location,
  remoteOk: c.remoteOk,
  compensation: c.compensation,
  status: c.status,
  interestCount: c.interestCount,
  createdAt: c.createdAt,
  author: people.get(String(c.authorId)) || unknownPerson(c.authorId),
  isMine: String(c.authorId) === viewer,
  hasExpressedInterest: interestedSet.has(String(c._id)),
});

const sanitizeCollab = (b = {}) => {
  const data = {
    type: pickEnum(b.type, COLLAB_TYPES),
    title: str(b.title, 140),
    description: str(b.description, 4000),
    skills: strList(b.skills, 10),
    commitment: pickEnum(b.commitment, ["full_time", "part_time", "one_off", "flexible"]),
    location: str(b.location, 80),
    remoteOk: b.remoteOk !== false,
    compensation: str(b.compensation, 120),
  };
  if (!data.type) throw httpError(400, "Pick a post type.");
  if (data.title.length < 5 || data.description.length < 20) throw httpError(400, "Add a clear title and a description of at least 20 characters.");
  return data;
};

export const listCollab = handle(async (req, res) => {
  const viewer = meId(req);
  const q = req.query;
  const filter = { status: q.status === "closed" ? "closed" : "open" };
  if (COLLAB_TYPES.includes(q.type)) filter.type = q.type;
  if (q.mine === "1") filter.authorId = viewer;
  if (q.search) {
    const rx = new RegExp(escapeRegex(str(q.search, 80)), "i");
    filter.$or = [{ title: rx }, { description: rx }, { skills: rx }];
  }
  const posts = await CollabPost.find(filter).sort({ createdAt: -1 }).limit(100).lean();
  const [people, interests] = await Promise.all([
    loadPeople(posts.map((p) => p.authorId)),
    CollabInterest.find({ accountId: viewer, postId: { $in: posts.map((p) => p._id) } }).select("postId").lean(),
  ]);
  const interested = new Set(interests.map((i) => String(i.postId)));
  res.status(200).json({ posts: posts.map((p) => collabJSON(p, people, viewer, interested)) });
});

export const createCollab = handle(async (req, res) => {
  const viewer = meId(req);
  const openCount = await CollabPost.countDocuments({ authorId: viewer, status: "open" });
  if (openCount >= 10) throw httpError(429, "You have 10 open posts. Close some before posting more.");
  const post = await CollabPost.create({ ...sanitizeCollab(req.body), authorId: viewer });
  const people = await loadPeople([viewer]);
  res.status(201).json({ post: collabJSON(post.toObject(), people, viewer, new Set()) });
});

const ownCollab = async (req, allowAdmin = false) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Post not found.");
  const post = await CollabPost.findById(req.params.id);
  if (!post) throw httpError(404, "Post not found.");
  if (String(post.authorId) !== meId(req) && !(allowAdmin && isAdminUser(req))) throw httpError(403, "Only the author can do that.");
  return post;
};

export const updateCollab = handle(async (req, res) => {
  const post = await ownCollab(req);
  if (req.body?.status && Object.keys(req.body).length === 1) {
    post.status = req.body.status === "closed" ? "closed" : "open";
  } else {
    post.set({ ...sanitizeCollab(req.body), ...(req.body?.status ? { status: req.body.status === "closed" ? "closed" : "open" } : {}) });
  }
  await post.save();
  const people = await loadPeople([post.authorId]);
  res.status(200).json({ post: collabJSON(post.toObject(), people, meId(req), new Set()) });
});

export const deleteCollab = handle(async (req, res) => {
  const post = await ownCollab(req, true);
  await Promise.all([post.deleteOne(), CollabInterest.deleteMany({ postId: post._id })]);
  res.status(200).json({ message: "Deleted." });
});

export const expressInterest = handle(async (req, res) => {
  const viewer = meId(req);
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Post not found.");
  const post = await CollabPost.findById(req.params.id);
  if (!post || post.status !== "open") throw httpError(404, "This post is no longer open.");
  if (String(post.authorId) === viewer) throw httpError(400, "That's your own post.");
  const message = str(req.body?.message, 1500);
  if (message.length < 10) throw httpError(400, "Add a short message about why you're a fit.");

  try {
    await CollabInterest.create({ postId: post._id, accountId: viewer, message });
  } catch (error) {
    if (error?.code === 11000) throw httpError(409, "You've already responded to this post.");
    throw error;
  }
  await CollabPost.updateOne({ _id: post._id }, { $inc: { interestCount: 1 } });

  // Deliver into the existing community inbox so the conversation continues there.
  await CommunityMessage.create({
    participants: [viewer, post.authorId],
    senderId: viewer,
    recipientId: post.authorId,
    text: `Re: your post "${post.title}"\n\n${message}`.slice(0, 2000),
  });
  res.status(201).json({ message: "Sent! Your message is in their inbox.", recipientId: String(post.authorId) });
});

export const listInterests = handle(async (req, res) => {
  const post = await ownCollab(req);
  const interests = await CollabInterest.find({ postId: post._id }).sort({ createdAt: -1 }).lean();
  const people = await loadPeople(interests.map((i) => i.accountId));
  res.status(200).json({
    interests: interests.map((i) => ({ _id: i._id, message: i.message, createdAt: i.createdAt, person: people.get(String(i.accountId)) || unknownPerson(i.accountId) })),
  });
});

/* ------------------------------------------------------------------ */
/* Network home summary + admin stats                                  */
/* ------------------------------------------------------------------ */

export const networkSummary = handle(async (req, res) => {
  const me = meId(req);
  const profile = await ensureProfile(me);
  const [connections, incoming, myGroups, openCollabs] = await Promise.all([
    Connection.countDocuments({ status: "accepted", $or: [{ requesterId: me }, { recipientId: me }] }),
    Connection.countDocuments({ status: "pending", recipientId: me }),
    GroupMembership.countDocuments({ accountId: me, status: "active" }),
    CollabPost.countDocuments({ authorId: me, status: "open" }),
  ]);
  const completeness = [profile.startupName, profile.oneLiner, profile.bio, profile.sectors.length, profile.stage, profile.city, profile.skills.length, profile.lookingFor.length].filter(Boolean).length;
  res.status(200).json({
    profileSlug: profile.slug,
    profileCompleteness: Math.round((completeness / 8) * 100),
    connections,
    incomingRequests: incoming,
    groups: myGroups,
    openCollabs,
    savedOpportunities: profile.savedOpportunityIds.length,
  });
});

export const adminNetworkStats = handle(async (req, res) => {
  const [profiles, listed, cofounders, connections, groups, collab, opportunities, pendingOpps] = await Promise.all([
    FounderProfile.countDocuments({}),
    FounderProfile.countDocuments({ isListed: true, startupName: { $ne: "" } }),
    FounderProfile.countDocuments({ "cofounder.isLooking": true }),
    Connection.countDocuments({ status: "accepted" }),
    Group.countDocuments({ isArchived: false }),
    CollabPost.countDocuments({ status: "open" }),
    Opportunity.countDocuments({ status: "published" }),
    Opportunity.countDocuments({ status: "pending" }),
  ]);
  res.status(200).json({ profiles, listed, cofounders, connections, groups, openCollabs: collab, opportunities, pendingOpportunities: pendingOpps });
});

export const adminListCollab = handle(async (req, res) => {
  const posts = await CollabPost.find({}).sort({ createdAt: -1 }).limit(300).lean();
  const people = await loadPeople(posts.map((p) => p.authorId));
  res.status(200).json({ posts: posts.map((p) => collabJSON(p, people, "", new Set())) });
});
