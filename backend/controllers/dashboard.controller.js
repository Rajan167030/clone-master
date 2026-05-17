import { Dashboard, Account, QRScanAnalytics } from "../models/index.js";

const assignIfDefined = (target, key, value) => {
  if (typeof value !== "undefined") {
    target[key] = value;
  }
};

export const getMyDashboard = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const role = req.user?.role;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Account not found." });
    }

    let dashboardDoc = await Dashboard.findOne({ accountId, role });
    if (!dashboardDoc) {
      dashboardDoc = await Dashboard.create({
        accountId,
        role,
        title: `${role.charAt(0).toUpperCase() + role.slice(1)} Workspace`,
        kpis: [],
        tables: { commitmentPortfolio: [], investmentPortfolio: [] }
      });
    }

    const dashboard = dashboardDoc.toSafeJSON();

    // 1. Calculate live Profile Completion %
    let completion = 20; // Baseline registered
    if (account.phone) completion += 15;
    if (account.city) completion += 15;
    if (account.headline && account.headline !== "Building the future with Founders Connect") completion += 20;
    if (account.profilePhoto) completion += 30;
    completion = Math.min(100, completion);

    // 2. Count live Referred Signups
    const referralCode = account.referralCode;
    const referralsCount = referralCode ? await Account.countDocuments({ referredBy: referralCode }) : 0;

    // 3. Count Profile Scans (dynamic activity)
    const totalScans = await QRScanAnalytics.countDocuments({ accountId });

    // 4. Overwrite kpis dynamically based on user role to show live activity!
    if (role === "user") {
      dashboard.kpis = [
        { key: "profile_completion", title: "Profile Completion", value: `${completion}%`, color: "blue" },
        { key: "referred_signups", title: "Referred Signups", value: String(referralsCount), color: "purple" },
        { key: "profile_scans", title: "Profile QR Scans", value: String(totalScans), color: "green" },
        { key: "communities_joined", title: "Communities Joined", value: "1", color: "amber" },
      ];
    } else if (role === "founder") {
      dashboard.kpis = [
        { key: "pitch_views", title: "Pitch / Card Views", value: String(totalScans), color: "blue" },
        { key: "referred_signups", title: "Referred Members", value: String(referralsCount), color: "purple" },
        { key: "profile_completion", title: "Profile Completion", value: `${completion}%`, color: "green" },
        { key: "funding_target", title: "Funding Target", value: account.roleDetails?.startupName ? "INR 25L" : "INR 0", color: "amber" },
      ];
    } else if (role === "investor") {
      dashboard.kpis = [
        { key: "profile_scans", title: "Profile QR Scans", value: String(totalScans), color: "blue" },
        { key: "startups_invested", title: "Startups Invested", value: String(account.roleDetails?.portfolioSize || 0), color: "green" },
        { key: "referred_members", title: "Referred Members", value: String(referralsCount), color: "purple" },
        { key: "profile_completion", title: "Profile Completion", value: `${completion}%`, color: "amber" },
      ];
    }

    return res.status(200).json({ dashboard });
  } catch (error) {
    return next(error);
  }
};

export const updateMyDashboard = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const role = req.user?.role;

    const dashboard = await Dashboard.findOne({ accountId, role });
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found for this account." });
    }

    const { title, kpis, tables, filters, widgetsData, layout, roleConfig } = req.body || {};

    assignIfDefined(dashboard, "title", title);
    assignIfDefined(dashboard, "kpis", kpis);
    assignIfDefined(dashboard, "tables", tables);
    assignIfDefined(dashboard, "filters", filters);
    assignIfDefined(dashboard, "widgetsData", widgetsData);
    assignIfDefined(dashboard, "layout", layout);
    assignIfDefined(dashboard, "roleConfig", roleConfig);
    dashboard.lastComputedAt = new Date();

    await dashboard.save();

    return res.status(200).json({
      message: "Dashboard updated successfully.",
      dashboard: dashboard.toSafeJSON(),
    });
  } catch (error) {
    return next(error);
  }
};
