import crypto from "crypto";
import mongoose from "mongoose";
import {
  FalconClubApplication,
  calculateSuggestedTier,
  FALCON_CLUB_TIERS,
  FALCON_CLUB_STATUSES,
  PERSONAL_NET_WORTH_RANGES,
  ANNUAL_COMPANY_REVENUE_RANGES,
  COMPANY_VALUATION_RANGES,
  VALUATION_BASIS_OPTIONS,
  DESIGNATION_OPTIONS,
} from "../models/falcon-club-application.model.js";
import { sendEmail } from "../utils/email.js";
import { createCloudinaryUploadSignature, createCloudinaryAuthenticatedUrl } from "../utils/cloudinary.js";
import {
  buildApplicationReceivedEmail,
  buildVerificationRequestEmail,
  buildApprovalEmail,
  buildStatusUpdateEmail,
} from "../utils/falcon-club-email-templates.js";

const VERIFICATION_LINK_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_DOCUMENTS = 10;
const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
const ALLOWED_DOCUMENT_FORMATS = ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx", "csv"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const frontendUrl = () =>
  (process.env.FRONTEND_URL || process.env.HOST_URL || "https://foundersconnect.co.in").replace(/\/+$/, "");

const clean = (value, max = 200) => String(value ?? "").trim().slice(0, max);

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const hashToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");

// Accepts "company.com" or a full URL; returns a normalized http(s) URL or null when invalid.
const normalizeUrl = (value) => {
  const raw = clean(value, 300);
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
};

const dispatchEmail = (to, subject, html) => {
  sendEmail({ to, subject, html }).catch((err) => {
    console.error(`Falcon Club email failed (${subject}):`, err?.message || err);
  });
};

const badRequest = (res, message) => res.status(400).json({ message });

/**
 * Submit a new FALCON Club membership application. Public.
 */
export const submitApplication = async (req, res, next) => {
  try {
    const body = req.body || {};

    const fullName = clean(body.fullName, 120);
    const mobileNumber = clean(body.mobileNumber, 20);
    const email = clean(body.email, 160).toLowerCase();
    const currentCity = clean(body.currentCity, 80);
    const companyName = clean(body.companyName, 160);
    const designation = clean(body.designation, 40);
    const customDesignation = clean(body.customDesignation, 80);
    const industry = clean(body.industry, 120);
    const alternativeInfo = clean(body.alternativeInfo, 2000);
    const whyJoin = clean(body.whyJoin, 2000);
    const referredBy = clean(body.referredBy, 120);
    const { personalNetWorth, annualCompanyRevenue, companyValuation } = body;
    const valuationBasis = body.valuationBasis || "Other / Not Formally Valued";

    if (!fullName || !mobileNumber || !email || !currentCity) {
      return badRequest(res, "Please provide all required personal details (Full Name, Mobile Number, Email, City).");
    }
    if (!EMAIL_PATTERN.test(email)) {
      return badRequest(res, "Please enter a valid email address.");
    }
    const mobileDigits = mobileNumber.replace(/\D/g, "");
    if (!/^\+?[\d\s()-]+$/.test(mobileNumber) || mobileDigits.length < 10 || mobileDigits.length > 15) {
      return badRequest(res, "Please enter a valid mobile number.");
    }

    if (!companyName || !designation || !industry) {
      return badRequest(res, "Please provide all required company details (Company Name, Designation, Industry).");
    }
    if (!DESIGNATION_OPTIONS.includes(designation)) {
      return badRequest(res, "Please select a valid designation.");
    }
    if (designation === "Other" && !customDesignation) {
      return badRequest(res, "Please specify your designation.");
    }

    const linkedinUrl = normalizeUrl(body.linkedinUrl);
    if (linkedinUrl === null || (linkedinUrl && !/(^|\.)linkedin\.com$/i.test(new URL(linkedinUrl).hostname))) {
      return badRequest(res, "Please enter a valid LinkedIn profile URL (linkedin.com/in/...).");
    }
    const companyWebsite = normalizeUrl(body.companyWebsite);
    if (companyWebsite === null) {
      return badRequest(res, "Please enter a valid company website URL.");
    }
    if (!linkedinUrl && !companyWebsite && alternativeInfo.length < 20) {
      return badRequest(
        res,
        "Please share your LinkedIn profile, company website, or a short description of your business background so we can verify your profile."
      );
    }

    if (
      !PERSONAL_NET_WORTH_RANGES.includes(personalNetWorth) ||
      !ANNUAL_COMPANY_REVENUE_RANGES.includes(annualCompanyRevenue) ||
      !COMPANY_VALUATION_RANGES.includes(companyValuation)
    ) {
      return badRequest(res, "Please select all financial details (Net Worth, Revenue, Valuation).");
    }
    if (!VALUATION_BASIS_OPTIONS.includes(valuationBasis)) {
      return badRequest(res, "Please select a valid valuation basis.");
    }

    if (body.confirmedAccurate !== true || body.agreedTerms !== true) {
      return badRequest(res, "You must confirm information accuracy and agree to terms & review policies.");
    }

    const existing = await FalconClubApplication.findOne({
      email,
      status: { $ne: "Rejected" },
    }).select("_id status");
    if (existing) {
      return res.status(409).json({
        message: `An application with this email is already on file (status: ${existing.status}). Our admissions team will be in touch.`,
      });
    }

    const { suggestedTier, suggestedTierReason } = calculateSuggestedTier({
      personalNetWorth,
      annualCompanyRevenue,
      companyValuation,
    });

    const application = await FalconClubApplication.create({
      fullName,
      mobileNumber,
      email,
      currentCity,
      linkedinUrl,
      companyName,
      companyWebsite,
      designation,
      customDesignation: designation === "Other" ? customDesignation : "",
      industry,
      alternativeInfo,
      personalNetWorth,
      annualCompanyRevenue,
      companyValuation,
      valuationBasis,
      whyJoin,
      referredBy,
      confirmedAccurate: true,
      agreedTerms: true,
      consentDirectory: body.consentDirectory === true,
      consentLinkedin: body.consentDirectory === true && body.consentLinkedin === true,
      suggestedTier,
      suggestedTierReason,
      status: "New Application",
    });

    dispatchEmail(
      application.email,
      "Membership request received · FALCON Club",
      buildApplicationReceivedEmail(application)
    );

    return res.status(201).json({
      success: true,
      message:
        "Your membership request for FALCON Club has been submitted successfully. It is now undergoing manual verification by our admissions committee.",
      application: {
        _id: application._id,
        fullName: application.fullName,
        companyName: application.companyName,
        suggestedTier: application.suggestedTier,
        suggestedTierReason: application.suggestedTierReason,
        status: application.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Private member directory for logged-in users.
 * Shows only approved members who consented to be listed. Never returns financial
 * details or documents.
 */
export const getPublicMembersDirectory = async (req, res, next) => {
  try {
    const { search = "", tier = "", page = 1, limit = 50 } = req.query;

    const conditions = [{ status: "Approved", showInDirectory: true, consentDirectory: true }];

    if (tier && tier !== "all") {
      conditions.push({
        $or: [
          { approvedTier: tier },
          { approvedTier: { $in: ["", null] }, suggestedTier: tier },
        ],
      });
    }

    const searchText = clean(search, 80);
    if (searchText) {
      const searchRegex = new RegExp(escapeRegex(searchText), "i");
      conditions.push({
        $or: [
          { fullName: searchRegex },
          { companyName: searchRegex },
          { industry: searchRegex },
          { currentCity: searchRegex },
        ],
      });
    }

    const filter = { $and: conditions };
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [members, total] = await Promise.all([
      FalconClubApplication.find(filter)
        .select(
          "fullName companyName designation customDesignation industry currentCity approvedTier suggestedTier linkedinUrl allowPublicLinkedin consentLinkedin reviewedAt createdAt"
        )
        .sort({ reviewedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      FalconClubApplication.countDocuments(filter),
    ]);

    const sanitizedMembers = members.map((m) => ({
      _id: m._id,
      fullName: m.fullName,
      companyName: m.companyName,
      designation: m.customDesignation || m.designation,
      industry: m.industry,
      currentCity: m.currentCity,
      membershipTier: m.approvedTier || m.suggestedTier,
      linkedinUrl: m.consentLinkedin && m.allowPublicLinkedin ? m.linkedinUrl : "",
      memberSince: m.reviewedAt || m.createdAt,
    }));

    return res.status(200).json({
      success: true,
      members: sanitizedMembers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: List all applications with full financial and verification details.
 */
export const getAdminApplications = async (req, res, next) => {
  try {
    const { search = "", status = "", tier = "", page = 1, limit = 50 } = req.query;

    const conditions = [];

    if (status && status !== "all") {
      conditions.push({ status });
    }

    if (tier && tier !== "all") {
      conditions.push({ $or: [{ approvedTier: tier }, { suggestedTier: tier }] });
    }

    const searchText = clean(search, 80);
    if (searchText) {
      const regex = new RegExp(escapeRegex(searchText), "i");
      conditions.push({
        $or: [
          { fullName: regex },
          { email: regex },
          { companyName: regex },
          { mobileNumber: regex },
          { currentCity: regex },
          { industry: regex },
        ],
      });
    }

    const filter = conditions.length ? { $and: conditions } : {};
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      FalconClubApplication.find(filter)
        .populate("reviewedBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      FalconClubApplication.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      applications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const findApplicationOr404 = async (id, res) => {
  if (!mongoose.isValidObjectId(id)) {
    res.status(404).json({ message: "Application not found." });
    return null;
  }
  const application = await FalconClubApplication.findById(id);
  if (!application) {
    res.status(404).json({ message: "Application not found." });
    return null;
  }
  return application;
};

/**
 * Admin: Update application status, approved tier, internal notes and directory toggles.
 */
export const updateApplicationAdmin = async (req, res, next) => {
  try {
    const { status, approvedTier, adminNotes, showInDirectory, allowPublicLinkedin } = req.body || {};

    if (status !== undefined && !FALCON_CLUB_STATUSES.includes(status)) {
      return badRequest(res, "Invalid application status.");
    }
    if (approvedTier !== undefined && approvedTier !== "" && !FALCON_CLUB_TIERS.includes(approvedTier)) {
      return badRequest(res, "Invalid membership tier.");
    }

    const application = await findApplicationOr404(req.params.id, res);
    if (!application) return undefined;

    const previousStatus = application.status;

    if (status) application.status = status;
    if (approvedTier !== undefined) application.approvedTier = approvedTier;
    if (adminNotes !== undefined) application.adminNotes = clean(adminNotes, 5000);
    if (showInDirectory !== undefined) application.showInDirectory = Boolean(showInDirectory);
    if (allowPublicLinkedin !== undefined) application.allowPublicLinkedin = Boolean(allowPublicLinkedin);

    // The final tier is always an explicit admin decision.
    if (application.status === "Approved" && !application.approvedTier) {
      return badRequest(res, "Select the final confirmed membership tier before approving.");
    }

    // A closed application no longer needs its upload link.
    if (["Approved", "Rejected"].includes(application.status)) {
      application.verificationTokenHash = undefined;
      application.verificationTokenExpires = undefined;
    }

    application.reviewedBy = req.user?.id || application.reviewedBy;
    application.reviewedAt = new Date();

    await application.save();

    if (application.status !== previousStatus) {
      if (application.status === "Approved") {
        dispatchEmail(
          application.email,
          `Membership approved · Welcome to FALCON Club [${application.approvedTier}]`,
          buildApprovalEmail(application, application.approvedTier)
        );
      } else if (["Rejected", "Waitlisted"].includes(application.status)) {
        dispatchEmail(
          application.email,
          "An update on your FALCON Club application",
          buildStatusUpdateEmail(application, application.status)
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Application updated successfully.",
      application,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Request supporting documents. Emails the applicant a private upload link.
 */
export const requestVerificationAdmin = async (req, res, next) => {
  try {
    const application = await findApplicationOr404(req.params.id, res);
    if (!application) return undefined;

    const token = crypto.randomBytes(32).toString("hex");

    application.status = "Verification Required";
    application.verificationRequestSent = true;
    application.verificationRequestDate = new Date();
    application.verificationRequestNote =
      clean(req.body?.note, 2000) || "Please share supporting evidence for your requested membership tier.";
    application.verificationTokenHash = hashToken(token);
    application.verificationTokenExpires = new Date(Date.now() + VERIFICATION_LINK_TTL_MS);
    application.reviewedBy = req.user?.id || application.reviewedBy;
    application.reviewedAt = new Date();

    await application.save();

    const uploadUrl = `${frontendUrl()}/falcon-club/verify/${token}`;
    dispatchEmail(
      application.email,
      `Verification requested · FALCON Club [Ref: ${application._id.toString().slice(-6)}]`,
      buildVerificationRequestEmail(application, uploadUrl)
    );

    return res.status(200).json({
      success: true,
      message: "Verification request with a secure upload link sent to the applicant.",
      application,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Short-lived signed URL to view one private verification document.
 */
export const getDocumentUrlAdmin = async (req, res, next) => {
  try {
    const application = await findApplicationOr404(req.params.id, res);
    if (!application) return undefined;

    const document = application.documents.id(req.params.docId);
    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const url = createCloudinaryAuthenticatedUrl({
      publicId: document.publicId,
      resourceType: document.resourceType,
      format: document.format,
    });

    return res.status(200).json({ success: true, url });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Delete application.
 */
export const deleteApplicationAdmin = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: "Application not found." });
    }
    const application = await FalconClubApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin: Aggregated stats.
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      total,
      newApps,
      underReview,
      verificationRequired,
      approved,
      waitlisted,
      rejected,
      bySuggestedTier,
      byApprovedTier,
    ] = await Promise.all([
      FalconClubApplication.countDocuments(),
      FalconClubApplication.countDocuments({ status: "New Application" }),
      FalconClubApplication.countDocuments({ status: "Under Review" }),
      FalconClubApplication.countDocuments({ status: "Verification Required" }),
      FalconClubApplication.countDocuments({ status: "Approved" }),
      FalconClubApplication.countDocuments({ status: "Waitlisted" }),
      FalconClubApplication.countDocuments({ status: "Rejected" }),
      FalconClubApplication.aggregate([
        { $group: { _id: "$suggestedTier", count: { $sum: 1 } } },
      ]),
      FalconClubApplication.aggregate([
        { $match: { approvedTier: { $ne: "" } } },
        { $group: { _id: "$approvedTier", count: { $sum: 1 } } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        newApps,
        underReview,
        verificationRequired,
        approved,
        waitlisted,
        rejected,
        bySuggestedTier: Object.fromEntries(bySuggestedTier.map((item) => [item._id || "Other", item.count])),
        byApprovedTier: Object.fromEntries(byApprovedTier.map((item) => [item._id, item.count])),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------------------------------------------
// Applicant-facing secure verification upload (token from the emailed link)
// ---------------------------------------------------------------------------

const findByVerificationToken = async (token, res) => {
  if (!/^[a-f0-9]{64}$/.test(String(token || ""))) {
    res.status(404).json({ message: "This verification link is invalid or has expired." });
    return null;
  }
  const application = await FalconClubApplication.findOne({
    verificationTokenHash: hashToken(token),
    verificationTokenExpires: { $gt: new Date() },
  });
  if (!application) {
    res.status(404).json({ message: "This verification link is invalid or has expired." });
    return null;
  }
  return application;
};

const documentFolder = (application) => `falcon-club/verification/${application._id}`;

const verificationView = (application) => ({
  fullName: application.fullName,
  companyName: application.companyName,
  note: application.verificationRequestNote,
  expiresAt: application.verificationTokenExpires,
  submittedAt: application.documentsSubmittedAt,
  documents: application.documents.map((d) => ({
    _id: d._id,
    label: d.label,
    originalName: d.originalName,
    uploadedAt: d.uploadedAt,
  })),
});

export const getVerificationRequest = async (req, res, next) => {
  try {
    const application = await findByVerificationToken(req.params.token, res);
    if (!application) return undefined;
    return res.status(200).json({ success: true, request: verificationView(application) });
  } catch (error) {
    return next(error);
  }
};

export const signVerificationUpload = async (req, res, next) => {
  try {
    const application = await findByVerificationToken(req.params.token, res);
    if (!application) return undefined;

    if (application.documents.length >= MAX_DOCUMENTS) {
      return badRequest(res, `You can upload up to ${MAX_DOCUMENTS} documents.`);
    }

    const signature = createCloudinaryUploadSignature({
      folder: documentFolder(application),
      resourceType: "auto",
      type: "authenticated",
    });

    return res.status(200).json(signature);
  } catch (error) {
    return next(error);
  }
};

export const addVerificationDocument = async (req, res, next) => {
  try {
    const application = await findByVerificationToken(req.params.token, res);
    if (!application) return undefined;

    if (application.documents.length >= MAX_DOCUMENTS) {
      return badRequest(res, `You can upload up to ${MAX_DOCUMENTS} documents.`);
    }

    const { publicId, resourceType, format, bytes, originalName, label } = req.body || {};
    const safePublicId = clean(publicId, 300);

    // Only accept assets that were uploaded into this application's private folder.
    if (!safePublicId.startsWith(`${documentFolder(application)}/`) || safePublicId.includes("..")) {
      return badRequest(res, "Invalid document reference.");
    }
    if (!["image", "raw"].includes(resourceType)) {
      return badRequest(res, "Unsupported document type.");
    }

    const name = clean(originalName, 200);
    const extension = (clean(format, 10) || name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_DOCUMENT_FORMATS.includes(extension)) {
      return badRequest(res, "Please upload a PDF, image, Word, Excel or CSV file.");
    }
    if (Number(bytes) > MAX_DOCUMENT_BYTES) {
      return badRequest(res, "Each document must be 15 MB or smaller.");
    }

    application.documents.push({
      label: clean(label, 120),
      originalName: name,
      publicId: safePublicId,
      resourceType,
      format: resourceType === "raw" ? "" : clean(format, 10).toLowerCase(),
      bytes: Number(bytes) || 0,
    });
    await application.save();

    return res.status(201).json({ success: true, request: verificationView(application) });
  } catch (error) {
    return next(error);
  }
};

export const submitVerificationDocuments = async (req, res, next) => {
  try {
    const application = await findByVerificationToken(req.params.token, res);
    if (!application) return undefined;

    if (!application.documents.length) {
      return badRequest(res, "Please upload at least one document before submitting.");
    }

    application.documentsSubmittedAt = new Date();
    if (application.status === "Verification Required") {
      application.status = "Under Review";
    }
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Thank you. Your documents have been submitted securely for review.",
      request: verificationView(application),
    });
  } catch (error) {
    return next(error);
  }
};
