import { FundingApplication } from "../models/funding-application.model.js";
import { createCloudinaryUploadSignature } from "../utils/cloudinary.js";

export const getPublicCloudinaryUploadSignature = async (req, res, next) => {
  try {
    const { folder, publicId, resourceType } = req.body || {};
    const signedUpload = createCloudinaryUploadSignature({
      folder: String(folder || "founders-connect/funding-decks").trim(),
      publicId: String(publicId || "").trim(),
      resourceType: String(resourceType || "auto").trim() || "auto",
    });

    return res.status(200).json(signedUpload);
  } catch (error) {
    return next(error);
  }
};

export const submitFundingApplication = async (req, res, next) => {
  try {
    const {
      name,
      mobile,
      email,
      address,
      startupName,
      startupLink,
      sector,
      sectorOther,
      mrr,
      mrrOther,
      brief,
      pitchDeckUrl,
      pitchDeckName,
      problem,
      solution,
      targetCustomers,
      revenue6Months,
      growthRate,
      payingCustomers,
      raisedBefore,
      raisedDetails,
      raiseAmountRange,
      stage,
      agreeAccurate,
      agreePromo,
    } = req.body || {};

    const requiredFields = [name, mobile, email, address, startupName, brief, problem, solution, targetCustomers];
    if (requiredFields.some((value) => !String(value || "").trim())) {
      return res.status(400).json({ ok: false, message: "Missing required fields" });
    }

    const application = new FundingApplication({
      name,
      mobile,
      email,
      address,
      startupName,
      startupLink,
      sector,
      sectorOther,
      mrr,
      mrrOther,
      brief,
      pitchDeckUrl,
      pitchDeckName,
      problem,
      solution,
      targetCustomers,
      revenue6Months,
      growthRate,
      payingCustomers,
      raisedBefore,
      raisedDetails,
      raiseAmountRange,
      stage,
      agreeAccurate: Boolean(agreeAccurate),
      agreePromo: Boolean(agreePromo),
      status: "pending",
    });

    await application.save();
    return res.status(201).json({ ok: true, id: application._id });
  } catch (error) {
    return next(error);
  }
};

export const listAdminFundingApplications = async (req, res, next) => {
  try {
    const applications = await FundingApplication.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ applications });
  } catch (error) {
    return next(error);
  }
};