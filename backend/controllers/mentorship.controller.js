import crypto from "crypto";
import mongoose from "mongoose";
import { MentorInvite, MentorApplication, MentorConnectRequest, SpeakerInvestorProfile } from "../models/index.js";
import { deleteCache } from "../utils/cache.js";
import { sendEmail } from "../utils/email.js";

const FRONTEND_URL = () =>
  (process.env.FRONTEND_URL || process.env.HOST_URL || "https://foundersconnect.co.in").replace(/\/+$/, "");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v, max = 2000) => String(v ?? "").trim().slice(0, max);
const toList = (v) =>
  (Array.isArray(v) ? v : String(v || "").split(","))
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 15);
const isHttpUrl = (v) => !v || /^https?:\/\//i.test(v);
const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const httpError = (status, message) => Object.assign(new Error(message), { status });

const clearMentorCaches = () =>
  deleteCache(
    "public:speaker-investors",
    "public:speaker-investors:mentor",
    "public:mentors",
    "admin:speaker-investors",
  );

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "mentor";

const uniqueProfileSlug = async (name) => {
  const base = slugify(name);
  let candidate = base;
  let n = 1;
  while (await SpeakerInvestorProfile.exists({ slug: candidate })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
};

// Light-card email shell (white card + solid violet accent) shared by all mentorship emails.
const emailShell = (title, bodyHtml, cta) => `
<div style="background:#f5f3ff;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1e1b2e">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e9e5f7;border-radius:14px;overflow:hidden">
    <div style="height:4px;background:#7c3aed"></div>
    <div style="padding:28px">
      <p style="margin:0 0 6px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;font-weight:700">Founders Connect · Mentorship</p>
      <h1 style="margin:0 0 16px;font-size:20px;color:#1e1b2e">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#4b4763">${bodyHtml}</div>
      ${
        cta
          ? `<p style="margin:24px 0 0"><a href="${cta.href}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600;font-size:14px">${cta.label}</a></p>`
          : ""
      }
    </div>
  </div>
</div>`;

const toSafeInvite = (invite) => ({
  _id: invite._id,
  token: invite.token,
  label: invite.label,
  email: invite.email,
  isActive: invite.isActive,
  expiresAt: invite.expiresAt,
  usedAt: invite.usedAt,
  applicationId: invite.applicationId,
  createdAt: invite.createdAt,
});

const inviteProblem = (invite) => {
  if (!invite || !invite.isActive) return "This invite link is invalid or has been revoked.";
  if (invite.usedAt) return "This invite link has already been used.";
  if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return "This invite link has expired.";
  return null;
};

/* ------------------------------------------------------------------ */
/* Public                                                              */
/* ------------------------------------------------------------------ */

export const validateMentorInvite = async (req, res, next) => {
  try {
    const invite = await MentorInvite.findOne({ token: str(req.params.token, 100) }).lean();
    const problem = inviteProblem(invite);
    if (problem) return res.status(410).json({ valid: false, message: problem });
    return res.status(200).json({ valid: true, label: invite.label, email: invite.email });
  } catch (error) {
    return next(error);
  }
};

export const submitMentorApplication = async (req, res, next) => {
  let reservedInviteId = null;
  try {
    const body = req.body || {};
    const payload = {
      fullName: str(body.fullName, 120),
      email: str(body.email, 200).toLowerCase(),
      phone: str(body.phone, 30),
      designation: str(body.designation, 150),
      company: str(body.company, 150),
      linkedinUrl: str(body.linkedinUrl, 300),
      websiteUrl: str(body.websiteUrl, 300),
      photoUrl: str(body.photoUrl, 500),
      bio: str(body.bio, 2000),
      expertise: toList(body.expertise),
      industries: toList(body.industries),
      yearsOfExperience: Math.max(0, Math.min(60, Number(body.yearsOfExperience) || 0)),
      availability: str(body.availability, 200),
    };

    if (!payload.fullName || !payload.email || !payload.designation || !payload.bio) {
      return res.status(400).json({ message: "Name, email, designation and bio are required." });
    }
    if (!EMAIL_RE.test(payload.email)) return res.status(400).json({ message: "Please enter a valid email." });
    if (payload.expertise.length === 0) return res.status(400).json({ message: "Add at least one area of expertise." });
    if (![payload.linkedinUrl, payload.websiteUrl, payload.photoUrl].every(isHttpUrl)) {
      return res.status(400).json({ message: "Links must start with http:// or https://" });
    }

    // Atomically reserve the single-use invite so two submissions can't both use it.
    const invite = await MentorInvite.findOneAndUpdate(
      {
        token: str(req.params.token, 100),
        isActive: true,
        usedAt: null,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
      },
      { $set: { usedAt: new Date() } },
      { new: true },
    );
    if (!invite) {
      return res.status(409).json({ message: "This invite link has already been used or is no longer valid." });
    }
    reservedInviteId = invite._id;

    const application = await MentorApplication.create({ ...payload, inviteId: invite._id });
    await MentorInvite.updateOne({ _id: invite._id }, { $set: { applicationId: application._id } });

    sendEmail({
      to: payload.email,
      subject: "We received your mentor application — Founders Connect",
      html: emailShell(
        `Thanks, ${escapeHtml(payload.fullName)}!`,
        "Your mentor profile has been submitted and is now with our team for review. We'll email you as soon as it's approved and live on the Founders Connect mentor network.",
      ),
    }).catch(() => {});

    return res.status(201).json({ message: "Application submitted. Our team will review it shortly." });
  } catch (error) {
    if (reservedInviteId) {
      await MentorInvite.updateOne({ _id: reservedInviteId }, { $set: { usedAt: null } }).catch(() => {});
    }
    return next(error);
  }
};

export const submitMentorConnectRequest = async (req, res, next) => {
  try {
    const mentor = await SpeakerInvestorProfile.findOne({
      slug: str(req.params.slug, 100),
      category: "mentor",
      isActive: true,
    }).lean();
    if (!mentor) return res.status(404).json({ message: "Mentor not found." });

    const body = req.body || {};
    const payload = {
      fullName: str(body.fullName, 120),
      email: str(body.email, 200).toLowerCase(),
      phone: str(body.phone, 30),
      startupName: str(body.startupName, 150),
      stage: str(body.stage, 60),
      topic: str(body.topic, 150),
      message: str(body.message, 2000),
      preferredMode: ["video", "in-person", "chat", "any"].includes(body.preferredMode) ? body.preferredMode : "any",
    };

    if (!payload.fullName || !payload.email || !payload.topic || !payload.message) {
      return res.status(400).json({ message: "Name, email, topic and message are required." });
    }
    if (!EMAIL_RE.test(payload.email)) return res.status(400).json({ message: "Please enter a valid email." });
    if (payload.message.length < 20) {
      return res.status(400).json({ message: "Tell the mentor a little more (at least 20 characters)." });
    }

    // Don't let the same person stack open requests to the same mentor.
    const duplicate = await MentorConnectRequest.exists({
      mentorProfileId: mentor._id,
      email: payload.email,
      status: { $in: ["new", "forwarded", "scheduled"] },
    });
    if (duplicate) {
      return res.status(409).json({ message: "You already have an open request with this mentor. We'll be in touch soon." });
    }

    await MentorConnectRequest.create({
      ...payload,
      mentorProfileId: mentor._id,
      mentorSlug: mentor.slug,
      mentorName: mentor.name,
      accountId: req.user?.id || null,
    });

    sendEmail({
      to: payload.email,
      subject: `Your request to connect with ${mentor.name} — Founders Connect`,
      html: emailShell(
        "Request received",
        `Hi ${escapeHtml(payload.fullName)}, we've received your request to connect with <strong>${escapeHtml(mentor.name)}</strong> on <em>${escapeHtml(payload.topic)}</em>. Our team reviews every request and will introduce you if it's a good fit.`,
      ),
    }).catch(() => {});

    return res.status(201).json({ message: "Request sent! We'll get back to you after reviewing it." });
  } catch (error) {
    return next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Admin: invites                                                      */
/* ------------------------------------------------------------------ */

export const listAdminMentorInvites = async (req, res, next) => {
  try {
    const invites = await MentorInvite.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ invites: invites.map(toSafeInvite) });
  } catch (error) {
    return next(error);
  }
};

export const createAdminMentorInvite = async (req, res, next) => {
  try {
    const label = str(req.body?.label, 120);
    const email = str(req.body?.email, 200).toLowerCase();
    const days = Number(req.body?.expiresInDays);
    if (email && !EMAIL_RE.test(email)) return res.status(400).json({ message: "Please enter a valid email." });

    const invite = await MentorInvite.create({
      token: crypto.randomBytes(20).toString("hex"),
      label,
      email,
      createdBy: req.user?.id || null,
      expiresAt: Number.isFinite(days) && days > 0 ? new Date(Date.now() + days * 86400000) : null,
    });

    const link = `${FRONTEND_URL()}/mentors/join/${invite.token}`;
    let emailed = false;
    if (email) {
      emailed = await sendEmail({
        to: email,
        subject: "You're invited to mentor founders — Founders Connect",
        html: emailShell(
          `You're invited${label ? `, ${escapeHtml(label)}` : ""}`,
          "The Founders Connect team would love to have you as a mentor in our invite-only network. Use the link below to set up your mentor profile — it only takes a few minutes. This link is personal and can be used once.",
          { href: link, label: "Create my mentor profile" },
        ),
      })
        .then((r) => Boolean(r?.ok))
        .catch(() => false);
    }

    return res.status(201).json({ message: "Mentor invite created.", invite: toSafeInvite(invite), link, emailed });
  } catch (error) {
    return next(error);
  }
};

export const setAdminMentorInviteActive = async (req, res, next) => {
  try {
    const invite = await MentorInvite.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: Boolean(req.body?.isActive) } },
      { new: true },
    );
    if (!invite) return res.status(404).json({ message: "Invite not found." });
    return res.status(200).json({ message: invite.isActive ? "Invite reactivated." : "Invite revoked.", invite: toSafeInvite(invite) });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminMentorInvite = async (req, res, next) => {
  try {
    const invite = await MentorInvite.findByIdAndDelete(req.params.id);
    if (!invite) return res.status(404).json({ message: "Invite not found." });
    return res.status(200).json({ message: "Invite deleted." });
  } catch (error) {
    return next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Admin: applications                                                 */
/* ------------------------------------------------------------------ */

export const listAdminMentorApplications = async (req, res, next) => {
  try {
    const filter = {};
    if (["pending", "approved", "rejected"].includes(req.query.status)) filter.status = req.query.status;
    const applications = await MentorApplication.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ applications });
  } catch (error) {
    return next(error);
  }
};

export const reviewAdminMentorApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const decision = req.body?.decision;
    const adminNotes = str(req.body?.adminNotes, 2000);
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be 'approve' or 'reject'." });
    }
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Application not found." });

    const application = await MentorApplication.findById(id);
    if (!application) return res.status(404).json({ message: "Application not found." });
    if (application.status !== "pending") {
      return res.status(409).json({ message: `This application was already ${application.status}.` });
    }

    if (decision === "approve") {
      const profile = await SpeakerInvestorProfile.create({
        slug: await uniqueProfileSlug(application.fullName),
        category: "mentor",
        name: application.fullName,
        designation: application.designation,
        company: application.company,
        photoUrl: application.photoUrl,
        photoAlt: application.fullName,
        summary: application.bio,
        linkedinUrl: application.linkedinUrl,
        websiteUrl: application.websiteUrl,
        isActive: true,
        metadata: {
          expertise: application.expertise,
          industries: application.industries,
          yearsOfExperience: application.yearsOfExperience,
          availability: application.availability,
          mentorApplicationId: application._id,
          contactEmail: application.email,
        },
      });
      application.profileId = profile._id;
      application.status = "approved";
      await clearMentorCaches();
    } else {
      application.status = "rejected";
    }

    application.adminNotes = adminNotes || application.adminNotes;
    application.reviewedBy = req.user?.id || null;
    application.reviewedAt = new Date();
    await application.save();

    const approved = application.status === "approved";
    sendEmail({
      to: application.email,
      subject: approved
        ? "You're live on the Founders Connect mentor network"
        : "Update on your Founders Connect mentor application",
      html: approved
        ? emailShell(
            `Welcome aboard, ${escapeHtml(application.fullName)}!`,
            "Your mentor profile has been approved and is now visible to founders. When a founder requests time with you, our team will review it and introduce you over email.",
            { href: `${FRONTEND_URL()}/mentors`, label: "View the mentor network" },
          )
        : emailShell(
            `Hi ${escapeHtml(application.fullName)},`,
            "Thank you for your interest in mentoring with Founders Connect. After review, we aren't able to onboard your profile at this time. We truly appreciate you offering your time to founders.",
          ),
    }).catch(() => {});

    return res.status(200).json({
      message: approved ? "Mentor approved and published." : "Application rejected.",
      application,
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    return next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Admin: connect requests                                             */
/* ------------------------------------------------------------------ */

const CONNECT_STATUSES = ["new", "forwarded", "scheduled", "completed", "declined"];

export const listAdminMentorConnectRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (CONNECT_STATUSES.includes(req.query.status)) filter.status = req.query.status;
    if (req.query.mentor) filter.mentorSlug = str(req.query.mentor, 100);
    const requests = await MentorConnectRequest.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    return res.status(200).json({ requests });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminMentorConnectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.body?.status;
    const update = {};
    if (status !== undefined) {
      if (!CONNECT_STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status." });
      update.status = status;
    }
    if (req.body?.adminNotes !== undefined) update.adminNotes = str(req.body.adminNotes, 2000);
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: "Request not found." });

    const request = await MentorConnectRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found." });
    const previousStatus = request.status;
    Object.assign(request, update);
    await request.save();

    // Moving to "forwarded" = admin introduces the founder to the mentor over email.
    let mentorEmailed = false;
    if (status === "forwarded" && previousStatus !== "forwarded") {
      const mentor = await SpeakerInvestorProfile.findById(request.mentorProfileId).lean();
      const mentorEmail = mentor?.metadata?.contactEmail;
      if (mentorEmail) {
        mentorEmailed = await sendEmail({
          to: mentorEmail,
          subject: `Mentorship request from ${request.fullName} — Founders Connect`,
          html: emailShell(
            `New mentorship request, ${escapeHtml(mentor.name)}`,
            `<p style="margin:0 0 12px">A founder from the Founders Connect community would like your guidance. You can reply directly to them at <a href="mailto:${escapeHtml(request.email)}" style="color:#7c3aed">${escapeHtml(request.email)}</a>.</p>
             <table style="width:100%;font-size:14px;border-collapse:collapse">
               <tr><td style="padding:4px 0;color:#8a85a3;width:130px">Founder</td><td>${escapeHtml(request.fullName)}</td></tr>
               ${request.startupName ? `<tr><td style="padding:4px 0;color:#8a85a3">Startup</td><td>${escapeHtml(request.startupName)}${request.stage ? ` · ${escapeHtml(request.stage)}` : ""}</td></tr>` : ""}
               <tr><td style="padding:4px 0;color:#8a85a3">Topic</td><td>${escapeHtml(request.topic)}</td></tr>
               <tr><td style="padding:4px 0;color:#8a85a3">Preferred mode</td><td>${escapeHtml(request.preferredMode)}</td></tr>
             </table>
             <p style="margin:14px 0 0;padding:12px;background:#f8f7fc;border-radius:8px;white-space:pre-wrap">${escapeHtml(request.message)}</p>`,
            { href: `mailto:${encodeURIComponent(request.email)}`, label: `Reply to ${escapeHtml(request.fullName)}` },
          ),
        })
          .then((r) => Boolean(r?.ok))
          .catch(() => false);
      }
    }

    return res.status(200).json({ message: "Request updated.", request, mentorEmailed });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminMentorConnectRequest = async (req, res, next) => {
  try {
    const request = await MentorConnectRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found." });
    return res.status(200).json({ message: "Request deleted." });
  } catch (error) {
    return next(error);
  }
};

export const getAdminMentorshipStats = async (req, res, next) => {
  try {
    const [pendingApplications, newRequests, activeMentors] = await Promise.all([
      MentorApplication.countDocuments({ status: "pending" }),
      MentorConnectRequest.countDocuments({ status: "new" }),
      SpeakerInvestorProfile.countDocuments({ category: "mentor", isActive: true }),
    ]);
    return res.status(200).json({ pendingApplications, newRequests, activeMentors });
  } catch (error) {
    return next(error);
  }
};
