import { Cohort } from "../models/index.js";
import { deleteCache, getCache, setCache } from "../utils/cache.js";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeStringArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

const sanitizeCohortPayload = (body = {}) => {
  const title = String(body.title || "").trim();
  const slug = slugify(body.slug || title);
  const allowedCategories = ["startup", "d2c", "general", "upcoming"];
  const categoryRaw = String(body.category || "startup").trim().toLowerCase();
  const category = allowedCategories.includes(categoryRaw) ? categoryRaw : "startup";

  return {
    title,
    slug,
    category,
    tagline: String(body.tagline || "").trim(),
    description: String(body.description || "").trim(),
    imageUrl: String(body.imageUrl || "").trim(),
    duration: String(body.duration || "8 Weeks").trim(),
    mode: String(body.mode || "Hybrid").trim(),
    startDate: String(body.startDate || "").trim(),
    status: String(body.status || "Waitlist Open").trim(),
    applicationUrl: String(body.applicationUrl || "/join-us").trim(),
    highlights: normalizeStringArray(body.highlights),
    order: Number(body.order || 0),
    isActive: typeof body.isActive === "boolean" ? body.isActive : true,
  };
};

export const listPublicCohorts = async (req, res, next) => {
  try {
    const requestedCategory = String(req.query?.category || "").trim().toLowerCase();
    const filter = { isActive: true };
    if (["startup", "d2c", "general", "upcoming"].includes(requestedCategory)) {
      filter.category = requestedCategory;
    }

    const cacheKey = requestedCategory ? `public:cohorts:${requestedCategory}` : "public:cohorts";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const cohorts = await Cohort.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const payload = { cohorts };
    await setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getPublicCohortBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const cacheKey = `public:cohort:${slug}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const cohort = await Cohort.findOne({ slug, isActive: true }).lean();
    if (!cohort) {
      return res.status(404).json({ message: "Cohort program not found." });
    }

    const payload = { cohort };
    await setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const listAdminCohorts = async (req, res, next) => {
  try {
    const cacheKey = "admin:cohorts";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const cohorts = await Cohort.find({}).sort({ order: 1, updatedAt: -1 }).lean();
    const payload = { cohorts };
    await setCache(cacheKey, payload, 60);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const createAdminCohort = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body cannot be empty." });
    }

    const payload = sanitizeCohortPayload(req.body);
    if (!payload.title) {
      return res.status(400).json({ message: "Cohort title is required." });
    }

    const existing = await Cohort.findOne({ slug: payload.slug }).lean();
    if (existing) {
      return res.status(409).json({ message: "A cohort with this slug already exists." });
    }

    payload.metadata = {
      createdBy: req.user?.sub || req.user?.id || null,
      createdByEmail: req.user?.email || null,
      createdAt: new Date(),
    };

    const cohort = await Cohort.create(payload);
    await deleteCache(
      "public:cohorts",
      "public:cohorts:startup",
      "public:cohorts:d2c",
      "public:cohorts:general",
      "public:cohorts:upcoming",
      "admin:cohorts"
    );

    return res.status(201).json({ message: "Cohort program created successfully.", cohort });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminCohort = async (req, res, next) => {
  try {
    const currentSlug = String(req.params.slug || "").trim();
    const payload = sanitizeCohortPayload(req.body);

    if (!payload.title) {
      return res.status(400).json({ message: "Cohort title is required." });
    }

    if (payload.slug && payload.slug !== currentSlug) {
      const duplicate = await Cohort.findOne({ slug: payload.slug }).lean();
      if (duplicate) {
        return res.status(409).json({ message: "A cohort with this slug already exists." });
      }
    }

    const cohort = await Cohort.findOneAndUpdate({ slug: currentSlug }, payload, { new: true });
    if (!cohort) {
      return res.status(404).json({ message: "Cohort program not found." });
    }

    await deleteCache(
      "public:cohorts",
      "public:cohorts:startup",
      "public:cohorts:d2c",
      "public:cohorts:general",
      "public:cohorts:upcoming",
      `public:cohort:${currentSlug}`,
      `public:cohort:${payload.slug}`,
      "admin:cohorts"
    );

    return res.status(200).json({ message: "Cohort program updated successfully.", cohort });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminCohort = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const cohort = await Cohort.findOneAndDelete({ slug });
    if (!cohort) {
      return res.status(404).json({ message: "Cohort program not found." });
    }

    await deleteCache(
      "public:cohorts",
      "public:cohorts:startup",
      "public:cohorts:d2c",
      "public:cohorts:general",
      "public:cohorts:upcoming",
      `public:cohort:${slug}`,
      "admin:cohorts"
    );

    return res.status(200).json({ message: "Cohort program deleted successfully." });
  } catch (error) {
    return next(error);
  }
};
