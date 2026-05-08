import { PartnerType } from "../models/partner-type.model.js";

export const listPublicPartnerTypes = async (req, res) => {
  try {
    const types = await PartnerType.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    return res.json({ types });
  } catch (err) {
    console.error("listPublicPartnerTypes failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to fetch partner types" });
  }
};

export const listAdminPartnerTypes = async (req, res) => {
  try {
    const types = await PartnerType.find().sort({ order: 1, name: 1 }).lean();
    return res.json({ types });
  } catch (err) {
    console.error("listAdminPartnerTypes failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to fetch partner types" });
  }
};

export const createAdminPartnerType = async (req, res) => {
  try {
    const { name, slug, order = 0, isActive = true } = req.body;
    if (!name || !slug) return res.status(400).json({ message: "name and slug are required" });

    const existing = await PartnerType.findOne({ slug });
    if (existing) return res.status(400).json({ message: "slug already exists" });

    const type = await PartnerType.create({ name, slug, order, isActive });
    return res.json({ message: "created", type });
  } catch (err) {
    console.error("createAdminPartnerType failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to create partner type" });
  }
};

export const updateAdminPartnerType = async (req, res) => {
  try {
    const { slug } = req.params;
    const payload = req.body;

    const type = await PartnerType.findOne({ slug });
    if (!type) return res.status(404).json({ message: "Partner type not found" });

    Object.assign(type, payload);
    await type.save();
    return res.json({ message: "updated", type });
  } catch (err) {
    console.error("updateAdminPartnerType failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to update partner type" });
  }
};

export const deleteAdminPartnerType = async (req, res) => {
  try {
    const { slug } = req.params;
    await PartnerType.deleteOne({ slug });
    return res.json({ message: "deleted" });
  } catch (err) {
    console.error("deleteAdminPartnerType failed:", err?.message || err);
    return res.status(500).json({ message: "Unable to delete partner type" });
  }
};

export default {
  listPublicPartnerTypes,
  listAdminPartnerTypes,
  createAdminPartnerType,
  updateAdminPartnerType,
  deleteAdminPartnerType,
};
