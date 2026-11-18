import mongoose from "mongoose";
import { Group, GroupMembership, GroupPost } from "../models/index.js";
import { handle, httpError, str, strList, pickEnum, isHttpUrl, escapeRegex, meId, isAdminUser, uniqueSlug, loadPeople, unknownPerson } from "../utils/network-helpers.js";

const CATEGORIES = ["sector", "city", "stage", "topic", "cohort"];

const groupJSON = (g, membership) => ({
  _id: g._id,
  slug: g.slug,
  name: g.name,
  description: g.description,
  kind: g.kind,
  category: g.category,
  tags: g.tags,
  coverImageUrl: g.coverImageUrl,
  privacy: g.privacy,
  maxMembers: g.maxMembers,
  memberCount: g.memberCount,
  meetingCadence: g.meetingCadence,
  nextMeetingAt: g.nextMeetingAt,
  // Meeting link only for active members.
  meetingUrl: membership?.status === "active" ? g.meetingUrl : "",
  isFeatured: g.isFeatured,
  isArchived: g.isArchived,
  isFull: g.maxMembers > 0 && g.memberCount >= g.maxMembers,
  createdAt: g.createdAt,
  membership: membership ? { role: membership.role, status: membership.status } : null,
});

const loadGroup = async (req) => {
  const group = await Group.findOne({ slug: str(req.params.slug, 80) });
  if (!group || (group.isArchived && !isAdminUser(req))) throw httpError(404, "Group not found.");
  const membership = await GroupMembership.findOne({ groupId: group._id, accountId: meId(req) }).lean();
  return { group, membership };
};

const canModerate = (req, membership) =>
  isAdminUser(req) || (membership?.status === "active" && ["owner", "moderator"].includes(membership.role));

const canReadPosts = (req, group, membership) =>
  isAdminUser(req) || membership?.status === "active" || group.privacy === "open";

const sanitizeGroup = (b = {}, req) => {
  const kind = pickEnum(b.kind, ["group", "circle"], "group");
  const maxMembers = Math.max(0, Math.min(5000, Number(b.maxMembers) || 0));
  const data = {
    name: str(b.name, 80),
    description: str(b.description, 3000),
    kind,
    category: pickEnum(b.category, CATEGORIES, "topic"),
    tags: strList(b.tags, 8),
    coverImageUrl: str(b.coverImageUrl, 500),
    privacy: pickEnum(b.privacy, ["open", "private"], kind === "circle" ? "private" : "open"),
    maxMembers: kind === "circle" ? Math.min(maxMembers || 10, 20) : maxMembers,
    meetingCadence: str(b.meetingCadence, 120),
    nextMeetingAt: b.nextMeetingAt ? new Date(b.nextMeetingAt) : null,
    meetingUrl: str(b.meetingUrl, 500),
  };
  if (data.nextMeetingAt && Number.isNaN(data.nextMeetingAt.getTime())) data.nextMeetingAt = null;
  if (data.name.length < 3) throw httpError(400, "Give the group a name (at least 3 characters).");
  if (![data.coverImageUrl, data.meetingUrl].every(isHttpUrl)) throw httpError(400, "Links must start with http:// or https://");
  if (isAdminUser(req) && b.isFeatured !== undefined) data.isFeatured = Boolean(b.isFeatured);
  return data;
};

/* ---------- groups ---------- */

export const listGroups = handle(async (req, res) => {
  const viewer = meId(req);
  const q = req.query;
  const filter = { isArchived: false };
  if (["group", "circle"].includes(q.kind)) filter.kind = q.kind;
  if (CATEGORIES.includes(q.category)) filter.category = q.category;
  if (q.search) {
    const rx = new RegExp(escapeRegex(str(q.search, 80)), "i");
    filter.$or = [{ name: rx }, { description: rx }, { tags: rx }];
  }
  const memberships = await GroupMembership.find({ accountId: viewer }).lean();
  const byGroup = new Map(memberships.map((m) => [String(m.groupId), m]));
  if (q.mine === "1") filter._id = { $in: memberships.map((m) => m.groupId) };

  const groups = await Group.find(filter).sort({ isFeatured: -1, memberCount: -1, createdAt: -1 }).limit(100).lean();
  res.status(200).json({ groups: groups.map((g) => groupJSON(g, byGroup.get(String(g._id)))) });
});

export const createGroup = handle(async (req, res) => {
  const viewer = meId(req);
  if (!isAdminUser(req)) {
    const owned = await GroupMembership.countDocuments({ accountId: viewer, role: "owner" });
    if (owned >= 5) throw httpError(429, "You can own up to 5 groups.");
  }
  const data = sanitizeGroup(req.body, req);
  const group = await Group.create({ ...data, slug: await uniqueSlug(Group, data.name, "group"), ownerId: viewer, memberCount: 1 });
  const membership = await GroupMembership.create({ groupId: group._id, accountId: viewer, role: "owner", status: "active" });
  res.status(201).json({ group: groupJSON(group.toObject(), membership.toObject()) });
});

export const getGroup = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  const [pendingCount, owner] = await Promise.all([
    canModerate(req, membership) ? GroupMembership.countDocuments({ groupId: group._id, status: "pending" }) : 0,
    loadPeople([group.ownerId]),
  ]);
  res.status(200).json({
    group: { ...groupJSON(group.toObject(), membership), owner: owner.get(String(group.ownerId)) || unknownPerson(group.ownerId) },
    canModerate: canModerate(req, membership),
    canReadPosts: canReadPosts(req, group, membership),
    pendingCount,
  });
});

export const updateGroup = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  if (!canModerate(req, membership)) throw httpError(403, "Only the group's owner or moderators can edit it.");
  const data = sanitizeGroup({ ...group.toObject(), ...req.body }, req);
  if (data.maxMembers > 0 && data.maxMembers < group.memberCount) throw httpError(400, `This group already has ${group.memberCount} members.`);
  group.set(data);
  if (isAdminUser(req) && req.body?.isArchived !== undefined) group.isArchived = Boolean(req.body.isArchived);
  await group.save();
  res.status(200).json({ group: groupJSON(group.toObject(), membership) });
});

export const archiveGroup = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  if (!isAdminUser(req) && membership?.role !== "owner") throw httpError(403, "Only the owner can delete this group.");
  group.isArchived = true;
  await group.save();
  res.status(200).json({ message: "Group archived." });
});

/* ---------- membership ---------- */

export const joinGroup = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  if (membership?.status === "active") return res.status(200).json({ status: "active" });
  if (membership?.status === "pending") return res.status(200).json({ status: "pending" });

  const isFull = group.maxMembers > 0 && group.memberCount >= group.maxMembers;
  if (group.privacy === "open") {
    if (isFull) throw httpError(409, "This group is full.");
    // Atomic capacity check so the last seat can't be double-booked.
    const updated = await Group.findOneAndUpdate(
      { _id: group._id, ...(group.maxMembers > 0 ? { memberCount: { $lt: group.maxMembers } } : {}) },
      { $inc: { memberCount: 1 } },
      { new: true },
    );
    if (!updated) throw httpError(409, "This group is full.");
    await GroupMembership.create({ groupId: group._id, accountId: meId(req), role: "member", status: "active" });
    return res.status(200).json({ status: "active" });
  }
  await GroupMembership.create({ groupId: group._id, accountId: meId(req), status: "pending", requestNote: str(req.body?.note, 500) });
  res.status(200).json({ status: "pending", isFull });
});

export const leaveGroup = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  if (!membership) return res.status(200).json({ status: "none" });
  if (membership.role === "owner") throw httpError(400, "Owners can't leave. Transfer ownership or delete the group.");
  await GroupMembership.deleteOne({ _id: membership._id });
  if (membership.status === "active") await Group.updateOne({ _id: group._id, memberCount: { $gt: 0 } }, { $inc: { memberCount: -1 } });
  res.status(200).json({ status: "none" });
});

export const listMembers = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  const mod = canModerate(req, membership);
  if (!mod && !canReadPosts(req, group, membership)) throw httpError(403, "Join this group to see its members.");
  const members = await GroupMembership.find({ groupId: group._id, ...(mod ? {} : { status: "active" }) }).sort({ role: 1, createdAt: 1 }).limit(500).lean();
  const people = await loadPeople(members.map((m) => m.accountId));
  res.status(200).json({
    members: members.map((m) => ({
      accountId: String(m.accountId),
      role: m.role,
      status: m.status,
      requestNote: mod ? m.requestNote : "",
      joinedAt: m.createdAt,
      person: people.get(String(m.accountId)) || unknownPerson(m.accountId),
    })),
  });
});

export const manageMember = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  if (!canModerate(req, membership)) throw httpError(403, "Only moderators can manage members.");
  if (!mongoose.isValidObjectId(req.params.accountId)) throw httpError(404, "Member not found.");
  const target = await GroupMembership.findOne({ groupId: group._id, accountId: req.params.accountId });
  if (!target) throw httpError(404, "Member not found.");
  const action = req.body?.action;

  if (action === "approve") {
    if (target.status !== "pending") return res.status(200).json({ status: target.status });
    const updated = await Group.findOneAndUpdate(
      { _id: group._id, ...(group.maxMembers > 0 ? { memberCount: { $lt: group.maxMembers } } : {}) },
      { $inc: { memberCount: 1 } },
      { new: true },
    );
    if (!updated) throw httpError(409, `This ${group.kind} is full (${group.maxMembers} members).`);
    target.status = "active";
    await target.save();
  } else if (action === "reject" || action === "remove") {
    if (target.role === "owner") throw httpError(400, "The owner can't be removed.");
    await target.deleteOne();
    if (target.status === "active") await Group.updateOne({ _id: group._id, memberCount: { $gt: 0 } }, { $inc: { memberCount: -1 } });
    return res.status(200).json({ status: "removed" });
  } else if (action === "promote" || action === "demote") {
    if (!isAdminUser(req) && membership.role !== "owner") throw httpError(403, "Only the owner can change roles.");
    if (target.role === "owner" || target.status !== "active") throw httpError(400, "Can't change this member's role.");
    target.role = action === "promote" ? "moderator" : "member";
    await target.save();
  } else {
    throw httpError(400, "Unknown action.");
  }
  res.status(200).json({ status: target.status, role: target.role });
});

/* ---------- posts ---------- */

const postJSON = (p, people, viewer) => ({
  _id: p._id,
  content: p.content,
  isPinned: p.isPinned,
  createdAt: p.createdAt,
  author: people.get(String(p.authorId)) || unknownPerson(p.authorId),
  likeCount: p.likes.length,
  likedByMe: p.likes.some((id) => String(id) === viewer),
  comments: p.comments.map((c) => ({ _id: c._id, content: c.content, createdAt: c.createdAt, author: people.get(String(c.authorId)) || unknownPerson(c.authorId) })),
  isMine: String(p.authorId) === viewer,
});

const peopleForPosts = (posts) => loadPeople(posts.flatMap((p) => [p.authorId, ...p.comments.map((c) => c.authorId)]));

export const listGroupPosts = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  if (!canReadPosts(req, group, membership)) throw httpError(403, "This is a private group. Request to join to see posts.");
  const before = req.query.before ? new Date(String(req.query.before)) : null;
  const posts = await GroupPost.find({ groupId: group._id, ...(before && !Number.isNaN(before.getTime()) ? { createdAt: { $lt: before }, isPinned: false } : {}) })
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(30)
    .lean();
  const people = await peopleForPosts(posts);
  res.status(200).json({ posts: posts.map((p) => postJSON(p, people, meId(req))), hasMore: posts.length === 30 });
});

const requireActiveMember = (req, membership) => {
  if (!isAdminUser(req) && membership?.status !== "active") throw httpError(403, "Join the group to take part.");
};

export const createGroupPost = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  requireActiveMember(req, membership);
  const content = str(req.body?.content, 3000);
  if (content.length < 2) throw httpError(400, "Write something first.");
  const post = await GroupPost.create({ groupId: group._id, authorId: meId(req), content });
  const people = await peopleForPosts([post]);
  res.status(201).json({ post: postJSON(post.toObject(), people, meId(req)) });
});

const loadPost = async (group, postId) => {
  if (!mongoose.isValidObjectId(postId)) throw httpError(404, "Post not found.");
  const post = await GroupPost.findOne({ _id: postId, groupId: group._id });
  if (!post) throw httpError(404, "Post not found.");
  return post;
};

export const deleteGroupPost = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  const post = await loadPost(group, req.params.postId);
  if (String(post.authorId) !== meId(req) && !canModerate(req, membership)) throw httpError(403, "You can't delete this post.");
  await post.deleteOne();
  res.status(200).json({ message: "Deleted." });
});

export const toggleGroupPostLike = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  requireActiveMember(req, membership);
  const post = await loadPost(group, req.params.postId);
  const me = meId(req);
  const liked = post.likes.some((id) => String(id) === me);
  await GroupPost.updateOne({ _id: post._id }, liked ? { $pull: { likes: me } } : { $addToSet: { likes: me } });
  res.status(200).json({ likedByMe: !liked, likeCount: post.likes.length + (liked ? -1 : 1) });
});

export const commentGroupPost = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  requireActiveMember(req, membership);
  const post = await loadPost(group, req.params.postId);
  const content = str(req.body?.content, 1000);
  if (!content) throw httpError(400, "Write a comment first.");
  post.comments.push({ authorId: meId(req), content });
  if (post.comments.length > 300) post.comments = post.comments.slice(-300);
  await post.save();
  const people = await peopleForPosts([post]);
  res.status(201).json({ post: postJSON(post.toObject(), people, meId(req)) });
});

export const pinGroupPost = handle(async (req, res) => {
  const { group, membership } = await loadGroup(req);
  if (!canModerate(req, membership)) throw httpError(403, "Only moderators can pin posts.");
  const post = await loadPost(group, req.params.postId);
  post.isPinned = !post.isPinned;
  await post.save();
  res.status(200).json({ isPinned: post.isPinned });
});

/* ---------- admin ---------- */

export const adminListGroups = handle(async (req, res) => {
  const groups = await Group.find({}).sort({ createdAt: -1 }).limit(500).lean();
  const people = await loadPeople(groups.map((g) => g.ownerId));
  res.status(200).json({ groups: groups.map((g) => ({ ...groupJSON(g, null), owner: people.get(String(g.ownerId)) || unknownPerson(g.ownerId) })) });
});

export const adminUpdateGroupFlags = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "Group not found.");
  const set = {};
  if (req.body?.isFeatured !== undefined) set.isFeatured = Boolean(req.body.isFeatured);
  if (req.body?.isArchived !== undefined) set.isArchived = Boolean(req.body.isArchived);
  const group = await Group.findByIdAndUpdate(req.params.id, { $set: set }, { new: true }).lean();
  if (!group) throw httpError(404, "Group not found.");
  res.status(200).json({ group: groupJSON(group, null) });
});
