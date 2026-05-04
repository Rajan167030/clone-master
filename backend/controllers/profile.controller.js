import { Account, QRScanAnalytics } from "../models/index.js";

/**
 * Get public profile by profileId
 * This route is publicly accessible - no auth required
 * Tracks QR code scans for analytics
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ message: "profileId is required." });
    }

    const account = await Account.findOne({ profileId }).lean();

    if (!account) {
      return res.status(404).json({ message: "Profile not found." });
    }

    // Track QR scan in background (don't block response)
    const scanMetadata = {
      userAgent: req.headers["user-agent"] || "",
      ipAddress: req.ip || req.connection.remoteAddress || "",
      referer: req.headers.referer || "",
      scanMethod: req.query.method || "qr", // qr, nfc, direct_link
      scanDevice: {
        type: detectDeviceType(req.headers["user-agent"] || ""),
        os: detectOS(req.headers["user-agent"] || ""),
      },
    };

    // Try to get user location if authenticated
    const scannedByUser = req.user || null;

    QRScanAnalytics.trackScan(profileId, account._id, scannedByUser, scanMetadata).catch(
      (err) => console.error("Failed to track scan:", err)
    );

    // Return only safe public profile data
    return res.status(200).json({
      profile: {
        id: account._id,
        fullName: account.fullName,
        role: account.role,
        city: account.city,
        headline: account.headline,
        profilePhoto: account.profilePhoto,
        profileId: account.profileId,
        cardColors: account.cardColors || {},
        roleDetails: account.roleDetails,
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Helper function to detect device type
const detectDeviceType = (userAgent) => {
  if (/mobile|android|iphone|ipod/i.test(userAgent)) return "mobile";
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  return "desktop";
};

// Helper function to detect OS
const detectOS = (userAgent) => {
  if (/windows/i.test(userAgent)) return "windows";
  if (/mac|macos/i.test(userAgent)) return "macos";
  if (/linux/i.test(userAgent)) return "linux";
  if (/android/i.test(userAgent)) return "android";
  if (/iphone|ipad|ios/i.test(userAgent)) return "ios";
  return "unknown";
};

/**
 * Update own profile (headline, photo, colors, etc.)
 * Requires authentication
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const { headline, profilePhoto, cardColors, nfcId } = req.body || {};
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const updates = {};
    if (headline !== undefined) updates.headline = String(headline).trim();
    if (profilePhoto !== undefined) updates.profilePhoto = String(profilePhoto).trim();
    if (nfcId !== undefined) updates.nfcId = String(nfcId).trim() || null;

    // Validate and update card colors
    if (cardColors !== undefined) {
      const validColors = {};
      if (cardColors.primary && /^#[0-9A-F]{6}$/i.test(cardColors.primary)) {
        validColors.primary = cardColors.primary;
      }
      if (cardColors.secondary && /^#[0-9A-F]{6}$/i.test(cardColors.secondary)) {
        validColors.secondary = cardColors.secondary;
      }
      if (cardColors.accent && /^#[0-9A-F]{6}$/i.test(cardColors.accent)) {
        validColors.accent = cardColors.accent;
      }
      if (cardColors.backgroundColor && /^#[0-9A-F]{6}$/i.test(cardColors.backgroundColor)) {
        validColors.backgroundColor = cardColors.backgroundColor;
      }
      if (Object.keys(validColors).length > 0) {
        updates.cardColors = validColors;
      }
    }

    const account = await Account.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      account: typeof account?.toSafeJSON === "function"
        ? account.toSafeJSON()
        : account.toObject?.() || account,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get my profile (authenticated)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const account = await Account.findById(userId);

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    return res.status(200).json({
      account: typeof account?.toSafeJSON === "function"
        ? account.toSafeJSON()
        : account.toObject?.() || account,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Generate new profile card QR code
 * Returns URL that should be encoded in QR
 */
export const generateProfileUrl = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const account = await Account.findById(userId).lean();

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    const profileUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/profile/${account.profileId}`;

    return res.status(200).json({
      profileUrl,
      profileId: account.profileId,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get QR code scan analytics
 * Shows scan statistics for last 30 days (or custom days)
 */
export const getProfileAnalytics = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { days = 30 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const account = await Account.findById(userId).lean();

    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    const analytics = await QRScanAnalytics.getProfileAnalytics(
      userId,
      account.profileId,
      parseInt(days) || 30
    );

    const result = analytics[0] || {
      totalScans: [{ count: 0 }],
      scansOverTime: [],
      scansByRole: [],
      scansByDevice: [],
      recentScans: [],
    };

    return res.status(200).json({
      analytics: {
        totalScans: result.totalScans[0]?.count || 0,
        scansOverTime: result.scansOverTime,
        scansByRole: result.scansByRole,
        scansByDevice: result.scansByDevice,
        recentScans: result.recentScans.map((scan) => ({
          scannedAt: scan.timestamp,
          scannedBy: scan.scannedByUser?.[0]?.fullName || "Anonymous",
          role: scan.scannedByRole,
          device: scan.scanDevice?.type || "unknown",
          method: scan.scanMethod,
        })),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export default {
  getPublicProfile,
  updateMyProfile,
  getMyProfile,
  generateProfileUrl,
  getProfileAnalytics,
};
