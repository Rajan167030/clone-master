import { CookieConsentLog } from "../models/index.js";

export const logConsent = async (req, res, next) => {
  try {
    const { visitorId, choice, path } = req.body || {};

    if (!["accepted", "denied"].includes(choice)) {
      return res.status(400).json({ message: "choice must be 'accepted' or 'denied'." });
    }
    if (!visitorId || typeof visitorId !== "string") {
      return res.status(400).json({ message: "visitorId is required." });
    }

    await CookieConsentLog.create({
      visitorId: visitorId.slice(0, 64),
      choice,
      accountId: req.user?.sub || null,
      path: String(path || "").slice(0, 200),
      userAgent: String(req.headers["user-agent"] || "").slice(0, 300),
    });

    return res.status(201).json({ ok: true });
  } catch (error) {
    return next(error);
  }
};

export const getConsentStats = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalAccepted, totalDenied, recent, dailyRows] = await Promise.all([
      CookieConsentLog.countDocuments({ choice: "accepted" }),
      CookieConsentLog.countDocuments({ choice: "denied" }),
      CookieConsentLog.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("accountId", "fullName email role")
        .lean(),
      CookieConsentLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, choice: "$choice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),
    ]);

    const dailyMap = new Map();
    for (const row of dailyRows) {
      const date = row._id.date;
      if (!dailyMap.has(date)) dailyMap.set(date, { date, accepted: 0, denied: 0 });
      dailyMap.get(date)[row._id.choice] = row.count;
    }

    const total = totalAccepted + totalDenied;

    return res.status(200).json({
      totalAccepted,
      totalDenied,
      total,
      acceptRate: total > 0 ? Math.round((totalAccepted / total) * 100) : 0,
      recent: recent.map((r) => ({
        id: r._id,
        choice: r.choice,
        path: r.path,
        userAgent: r.userAgent,
        account: r.accountId
          ? { id: r.accountId._id, fullName: r.accountId.fullName, email: r.accountId.email, role: r.accountId.role }
          : null,
        createdAt: r.createdAt,
      })),
      daily: Array.from(dailyMap.values()),
    });
  } catch (error) {
    return next(error);
  }
};
