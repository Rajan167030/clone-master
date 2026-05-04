import mongoose from "mongoose";

const { Schema } = mongoose;

const QRScanAnalyticsSchema = new Schema(
  {
    profileId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      default: null, // null if scanned by non-authenticated user
      index: true,
    },
    scannedByRole: {
      type: String,
      enum: ["user", "investor", "founder", "admin", "guest"],
      default: "guest",
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      city: { type: String, default: "", trim: true },
      country: { type: String, default: "", trim: true },
    },
    referer: {
      type: String,
      default: "",
      trim: true,
    },
    scanDevice: {
      type: {
        type: String,
        enum: ["mobile", "desktop", "tablet"],
        default: "mobile",
      },
      os: {
        type: String,
        enum: ["ios", "android", "windows", "macos", "linux", "unknown"],
        default: "unknown",
      },
    },
    scanMethod: {
      type: String,
      enum: ["qr", "nfc", "direct_link"],
      default: "qr",
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "qr_scan_analytics",
  }
);

// Indexes for efficient querying
QRScanAnalyticsSchema.index({ profileId: 1, timestamp: -1 });
QRScanAnalyticsSchema.index({ accountId: 1, timestamp: -1 });
QRScanAnalyticsSchema.index({ timestamp: -1 });

QRScanAnalyticsSchema.statics.trackScan = async function (
  profileId,
  accountId,
  scannedByUser,
  metadata = {}
) {
  try {
    return await this.create({
      profileId,
      accountId,
      scannedBy: scannedByUser?.id || null,
      scannedByRole: scannedByUser?.role || "guest",
      userAgent: metadata.userAgent || "",
      ipAddress: metadata.ipAddress || "",
      location: metadata.location || {},
      referer: metadata.referer || "",
      scanDevice: metadata.scanDevice || {},
      scanMethod: metadata.scanMethod || "qr",
    });
  } catch (error) {
    console.error("Error tracking QR scan:", error);
    return null;
  }
};

QRScanAnalyticsSchema.statics.getProfileAnalytics = async function (
  accountId,
  profileId,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        accountId: mongoose.Types.ObjectId.createFromHexString(accountId),
        profileId,
        timestamp: { $gte: startDate },
      },
    },
    {
      $facet: {
        totalScans: [{ $count: "count" }],
        scansOverTime: [
          {
            $group: {
              _id: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        scansByRole: [
          {
            $group: {
              _id: "$scannedByRole",
              count: { $sum: 1 },
            },
          },
        ],
        scansByDevice: [
          {
            $group: {
              _id: "$scanDevice.type",
              count: { $sum: 1 },
            },
          },
        ],
        recentScans: [
          { $sort: { timestamp: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "accounts",
              localField: "scannedBy",
              foreignField: "_id",
              as: "scannedByUser",
            },
          },
        ],
      },
    },
  ]);
};

export const QRScanAnalytics =
  mongoose.models.QRScanAnalytics ||
  mongoose.model("QRScanAnalytics", QRScanAnalyticsSchema);

export default QRScanAnalytics;
