import mongoose from "mongoose";
import { Cohort, CohortApplication } from "../models/index.js";
import { COHORT_APPLICATION_STATUSES } from "../models/cohort-application.model.js";
import { deleteCache } from "../utils/cache.js";
import { sendEmail } from "../utils/email.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = { short: 160, url: 500, long: 3000 };

const clean = (value, max = MAX.short) => String(value ?? "").trim().slice(0, max);

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const STATUS_LABELS = {
  new: "New",
  reviewing: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Not Selected",
};

// Light card + violet accent, matching the rest of the site's emails.
const buildConfirmationEmail = ({ founderName, startupName, cohortTitle }) => `
  <div style="background:#f5f3ff;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e9e5f5;border-top:4px solid #7c3aed;border-radius:16px;padding:32px 28px;color:#1e1b2e;">
      <p style="margin:0 0 24px;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;">Founders Connect</p>
      <h2 style="margin:0 0 12px;font-size:22px;">Application received</h2>
      <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#4b4763;">Hi ${escapeHtml(founderName)},</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4b4763;">
        Thanks for applying to <strong style="color:#1e1b2e;">${escapeHtml(cohortTitle)}</strong> with
        <strong style="color:#1e1b2e;">${escapeHtml(startupName)}</strong>. Our team reviews every application by hand
        and will get back to you with next steps.
      </p>
      <a href="https://foundersconnect.co.in/cohorts" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px;">View cohorts</a>
    </div>
    <p style="margin:20px 0 0;text-align:center;font-size:12px;color:#8e88a6;">© ${new Date().getFullYear()} Founders Connect</p>
  </div>
`;

const invalidateAdminCohorts = () => deleteCache("admin:cohorts");

export const submitCohortApplication = async (req, res, next) => {
  try {
    const slug = clean(req.params.slug);
    const cohort = await Cohort.findOne({ slug, isActive: true }).lean();
    if (!cohort) return res.status(404).json({ message: "Cohort program not found." });
    if (cohort.acceptingApplications === false) {
      return res.status(400).json({ message: "Applications for this cohort are closed." });
    }

    const body = req.body || {};
    const application = {
      founderName: clean(body.founderName),
      email: clean(body.email).toLowerCase(),
      phone: clean(body.phone, 30),
      city: clean(body.city),
      linkedinUrl: clean(body.linkedinUrl, MAX.url),
      startupName: clean(body.startupName),
      website: clean(body.website, MAX.url),
      industry: clean(body.industry),
      stage: clean(body.stage),
      teamSize: clean(body.teamSize, 40),
      monthlyRevenue: clean(body.monthlyRevenue, 60),
      fundingRaised: clean(body.fundingRaised, 60),
      pitch: clean(body.pitch, MAX.long),
      whyJoin: clean(body.whyJoin, MAX.long),
      deckUrl: clean(body.deckUrl, MAX.url),
      referralSource: clean(body.referralSource),
    };

    if (!application.founderName || !application.email || !application.phone || !application.startupName || !application.pitch) {
      return res.status(400).json({ message: "Please fill in your name, email, phone, startup name and pitch." });
    }
    if (!EMAIL_RE.test(application.email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }
    const digits = application.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) {
      return res.status(400).json({ message: "Please enter a valid phone number." });
    }

    const existing = await CohortApplication.findOne({ cohortSlug: cohort.slug, email: application.email }).lean();
    if (existing) {
      return res.status(409).json({ message: "You have already applied to this cohort with this email." });
    }

    const created = await CohortApplication.create({
      ...application,
      cohort: cohort._id,
      cohortSlug: cohort.slug,
      cohortTitle: cohort.title,
      statusHistory: [{ status: "new", note: "Application submitted", changedBy: "applicant" }],
    });
    await invalidateAdminCohorts();

    // Confirmation email is best-effort; never fail the submission over it.
    sendEmail({
      to: application.email,
      subject: `We received your application for ${cohort.title}`,
      html: buildConfirmationEmail({ ...application, cohortTitle: cohort.title }),
    }).catch((error) => console.warn("Cohort confirmation email failed:", error?.message || error));

    return res.status(201).json({
      message: "Application submitted successfully.",
      application: { _id: created._id, cohortTitle: cohort.title, status: created.status },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "You have already applied to this cohort with this email." });
    }
    return next(error);
  }
};

export const listAdminCohortApplications = async (req, res, next) => {
  try {
    const cohortSlug = clean(req.query.cohort);
    const status = clean(req.query.status);
    const search = clean(req.query.search, 100);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));

    const scope = {};
    if (cohortSlug && cohortSlug !== "all") scope.cohortSlug = cohortSlug;

    const filter = { ...scope };
    if (status && status !== "all" && COHORT_APPLICATION_STATUSES.includes(status)) filter.status = status;
    if (search) {
      const re = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ founderName: re }, { email: re }, { startupName: re }, { city: re }, { industry: re }];
    }

    const [applications, total, statusCounts] = await Promise.all([
      CohortApplication.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CohortApplication.countDocuments(filter),
      // Status counts ignore the status/search filter so the summary tiles stay stable.
      CohortApplication.aggregate([{ $match: scope }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

    const stats = Object.fromEntries(COHORT_APPLICATION_STATUSES.map((s) => [s, 0]));
    let all = 0;
    statusCounts.forEach(({ _id, count }) => {
      stats[_id] = count;
      all += count;
    });

    return res.status(200).json({
      applications,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      stats: { ...stats, total: all },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminCohortApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid application id." });

    const application = await CohortApplication.findById(id);
    if (!application) return res.status(404).json({ message: "Application not found." });

    const body = req.body || {};
    const actor = req.user?.email || "admin";

    if (body.status !== undefined) {
      const status = clean(body.status);
      if (!COHORT_APPLICATION_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status." });
      }
      if (status !== application.status) {
        application.status = status;
        application.statusHistory.push({
          status,
          note: clean(body.statusNote, 500) || `Moved to ${STATUS_LABELS[status]}`,
          changedBy: actor,
        });
      }
    }
    if (body.adminNotes !== undefined) application.adminNotes = clean(body.adminNotes, MAX.long);
    if (body.score !== undefined) {
      const score = body.score === null || body.score === "" ? null : Number(body.score);
      if (score !== null && (!Number.isFinite(score) || score < 0 || score > 10)) {
        return res.status(400).json({ message: "Score must be between 0 and 10." });
      }
      application.score = score;
    }

    await application.save();
    await invalidateAdminCohorts();
    return res.status(200).json({ message: "Application updated.", application });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminCohortApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid application id." });
    const deleted = await CohortApplication.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Application not found." });
    await invalidateAdminCohorts();
    return res.status(200).json({ message: "Application deleted." });
  } catch (error) {
    return next(error);
  }
};
