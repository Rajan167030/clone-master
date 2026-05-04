import { Dashboard } from "../models/index.js";

const assignIfDefined = (target, key, value) => {
  if (typeof value !== "undefined") {
    target[key] = value;
  }
};

export const getMyDashboard = async (req, res, next) => {
  try {
    const accountId = req.user?.sub;
    const role = req.user?.role;

    const dashboard = await Dashboard.findOne({ accountId, role });
    if (!dashboard) {
      return res.status(404).json({ message: "Dashboard not found for this account." });
    }

    return res.status(200).json({ dashboard: dashboard.toSafeJSON() });
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
