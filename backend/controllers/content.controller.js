import { BlogContent, EventContent, PartnerLogo, SiteNotice, SpeakerInvestorProfile } from "../models/index.js";
import { deleteCache, deleteCacheByPrefix, getCache, setCache } from "../utils/cache.js";
import { createCloudinaryUploadSignature } from "../utils/cloudinary.js";

const SITE_NOTICE_KEY = "landing-page-popup";

const normalizeStringArray = (value) =>
  Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeFaqs = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          question: String(item?.question || "").trim(),
          answer: String(item?.answer || "").trim(),
        }))
        .filter((item) => item.question && item.answer)
    : [];

const normalizeSections = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => ({
          heading: String(item?.heading || "").trim(),
          content: String(item?.content || "").trim(),
        }))
        .filter((item) => item.heading && item.content)
    : [];

const sanitizeEventPayload = (body = {}) => ({
  slug: String(body.slug || "").trim(),
  title: String(body.title || "").trim(),
  subtitle: String(body.subtitle || "").trim(),
  shortDescription: String(body.shortDescription || "").trim(),
  bannerImage: String(body.bannerImage || "").trim(),
  bannerAlt: String(body.bannerAlt || "").trim(),
  hostName: String(body.hostName || "").trim(),
  hostLogoText: String(body.hostLogoText || "FC").trim(),
  dateLabel: String(body.dateLabel || "").trim(),
  locationLabel: String(body.locationLabel || "").trim(),
  mapUrl: String(body.mapUrl || "").trim(),
  calendarUrl: String(body.calendarUrl || "").trim(),
  registrationUrl: String(body.registrationUrl || "").trim(),
  ticketLabel: String(body.ticketLabel || "").trim(),
  refundPolicy: String(body.refundPolicy || "").trim(),
  about: normalizeStringArray(body.about),
  expectations: normalizeStringArray(body.expectations),
  differentiators: normalizeStringArray(body.differentiators),
  audience: normalizeStringArray(body.audience),
  tags: normalizeStringArray(body.tags),
  photos: normalizeStringArray(body.photos),
  videos: normalizeStringArray(body.videos),
  faqs: normalizeFaqs(body.faqs),
  isPublished: typeof body.isPublished === "boolean" ? body.isPublished : true,
});

const sanitizeBlogPayload = (body = {}) => ({
  slug: String(body.slug || "").trim(),
  title: String(body.title || "").trim(),
  excerpt: String(body.excerpt || "").trim(),
  author: String(body.author || "").trim(),
  date: String(body.date || "").trim(),
  readTime: String(body.readTime || "").trim(),
  coverImage: String(body.coverImage || "").trim(),
  tags: normalizeStringArray(body.tags),
  sections: normalizeSections(body.sections),
  isPublished: typeof body.isPublished === "boolean" ? body.isPublished : true,
});

const sanitizeSiteNoticePayload = (body = {}) => ({
  key: SITE_NOTICE_KEY,
  title: String(body.title || "Announcement").trim() || "Announcement",
  message: String(body.message || "").trim(),
  buttonLabel: String(body.buttonLabel || "").trim(),
  buttonUrl: String(body.buttonUrl || "").trim(),
  isActive: typeof body.isActive === "boolean" ? body.isActive : false,
});

const sanitizePartnerPayload = (body = {}) => ({
  name: String(body.name || "").trim(),
  logoUrl: String(body.logoUrl || "").trim(),
  websiteUrl: String(body.websiteUrl || "").trim(),
  order: Number(body.order || 0),
  isActive: typeof body.isActive === "boolean" ? body.isActive : true,
});

const sanitizeSpeakerInvestorPayload = (body = {}) => ({
  slug: slugify(body.slug || body.name),
  category: String(body.category || "speaker").trim().toLowerCase() === "investor" ? "investor" : "speaker",
  name: String(body.name || "").trim(),
  designation: String(body.designation || "").trim(),
  company: String(body.company || "").trim(),
  photoUrl: String(body.photoUrl || "").trim(),
  photoAlt: String(body.photoAlt || "").trim(),
  summary: String(body.summary || "").trim(),
  linkedinUrl: String(body.linkedinUrl || "").trim(),
  websiteUrl: String(body.websiteUrl || "").trim(),
  order: Number(body.order || 0),
  isActive: typeof body.isActive === "boolean" ? body.isActive : true,
});

const requireSlugAndTitle = (payload, res) => {
  if (!payload.slug || !payload.title) {
    res.status(400).json({ message: "slug and title are required." });
    return false;
  }

  return true;
};

export const listPublicEvents = async (req, res, next) => {
  try {
    const cacheKey = "public:events";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const events = await EventContent.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    const payload = { events };
    await setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getPublicEventBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const cacheKey = `public:event:${slug}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const event = await EventContent.findOne({
      slug,
      isPublished: true,
    }).lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    const payload = { event };
    await setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const listPublicBlogs = async (req, res, next) => {
  try {
    const cacheKey = "public:blogs";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const posts = await BlogContent.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    const payload = { posts };
    await setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getPublicBlogBySlug = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const cacheKey = `public:blog:${slug}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const post = await BlogContent.findOne({
      slug,
      isPublished: true,
    }).lean();

    if (!post) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    const payload = { post };
    await setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getPublicSiteNotice = async (req, res, next) => {
  try {
    const cacheKey = "public:site-notice";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const notice = await SiteNotice.findOne({ key: SITE_NOTICE_KEY, isActive: true }).lean();
    const payload = { notice: notice || null };
    await setCache(cacheKey, payload, 120);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const listPublicPartnerLogos = async (req, res, next) => {
  try {
    const cacheKey = "public:partners";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const partners = await PartnerLogo.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    const payload = { partners };
    await setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const listPublicSpeakerInvestorProfiles = async (req, res, next) => {
  try {
    const cacheKey = "public:speaker-investors";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const profiles = await SpeakerInvestorProfile.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const payload = { profiles };
    await setCache(cacheKey, payload, 300);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

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

export const listAdminEvents = async (req, res, next) => {
  try {
    const cacheKey = "admin:events";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const events = await EventContent.find({}).sort({ updatedAt: -1 }).lean();
    const payload = { events };
    await setCache(cacheKey, payload, 60);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const createAdminEvent = async (req, res, next) => {
  try {
    const payload = sanitizeEventPayload(req.body);
    if (!requireSlugAndTitle(payload, res)) return;
    const event = await EventContent.create(payload);
    await deleteCache("public:events", "admin:events");
    await deleteCacheByPrefix("public:event:");
    return res.status(201).json({ message: "Event created successfully.", event });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminEvent = async (req, res, next) => {
  try {
    const payload = sanitizeEventPayload(req.body);
    const slug = String(req.params.slug || "").trim();
    const event = await EventContent.findOneAndUpdate({ slug }, payload, { new: true });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    await deleteCache("public:events", "admin:events", `public:event:${slug}`, `public:event:${payload.slug}`);
    return res.status(200).json({ message: "Event updated successfully.", event });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminEvent = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const event = await EventContent.findOneAndDelete({ slug });

    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    await deleteCache("public:events", "admin:events", `public:event:${slug}`);
    return res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

export const listAdminBlogs = async (req, res, next) => {
  try {
    const cacheKey = "admin:blogs";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const posts = await BlogContent.find({}).sort({ updatedAt: -1 }).lean();
    const payload = { posts };
    await setCache(cacheKey, payload, 60);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const createAdminBlog = async (req, res, next) => {
  try {
    const payload = sanitizeBlogPayload(req.body);
    if (!requireSlugAndTitle(payload, res)) return;
    const post = await BlogContent.create(payload);
    await deleteCache("public:blogs", "admin:blogs");
    await deleteCacheByPrefix("public:blog:");
    return res.status(201).json({ message: "Blog post created successfully.", post });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminBlog = async (req, res, next) => {
  try {
    const payload = sanitizeBlogPayload(req.body);
    const slug = String(req.params.slug || "").trim();
    const post = await BlogContent.findOneAndUpdate({ slug }, payload, { new: true });

    if (!post) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    await deleteCache("public:blogs", "admin:blogs", `public:blog:${slug}`, `public:blog:${payload.slug}`);
    return res.status(200).json({ message: "Blog post updated successfully.", post });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminBlog = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const post = await BlogContent.findOneAndDelete({ slug });

    if (!post) {
      return res.status(404).json({ message: "Blog post not found." });
    }

    await deleteCache("public:blogs", "admin:blogs", `public:blog:${slug}`);
    return res.status(200).json({ message: "Blog post deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

export const getAdminSiteNotice = async (req, res, next) => {
  try {
    const cacheKey = "admin:site-notice";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const notice = await SiteNotice.findOne({ key: SITE_NOTICE_KEY }).lean();
    const payload = { notice: notice || null };
    await setCache(cacheKey, payload, 60);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const listAdminPartnerLogos = async (req, res, next) => {
  try {
    const cacheKey = "admin:partners";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const partners = await PartnerLogo.find({}).sort({ order: 1, updatedAt: -1 }).lean();
    const payload = { partners };
    await setCache(cacheKey, payload, 60);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const listAdminSpeakerInvestorProfiles = async (req, res, next) => {
  try {
    const cacheKey = "admin:speaker-investors";
    const cached = await getCache(cacheKey);
    if (cached) return res.status(200).json(cached);

    const profiles = await SpeakerInvestorProfile.find({}).sort({ order: 1, updatedAt: -1 }).lean();
    const payload = { profiles };
    await setCache(cacheKey, payload, 60);
    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
};

export const createAdminSpeakerInvestorProfile = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty." });
    }

    const payload = sanitizeSpeakerInvestorPayload(req.body);

    if (!payload.name || !payload.designation) {
      return res.status(400).json({ message: "name and designation are required." });
    }

    const existing = await SpeakerInvestorProfile.findOne({ slug: payload.slug }).lean();
    if (existing) {
      return res.status(409).json({ message: "A speaker/investor with this slug already exists." });
    }

    try {
      payload.metadata = {
        createdBy: req.user?.sub || req.user?.id || null,
        createdByEmail: req.user?.email || null,
        createdAt: new Date(),
      };
    } catch (error) {
      // ignore metadata failures
    }

    const profile = await SpeakerInvestorProfile.create(payload);
    await deleteCache("public:speaker-investors", "admin:speaker-investors");
    return res.status(201).json({ message: "Speaker/investor profile created successfully.", profile });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminSpeakerInvestorProfile = async (req, res, next) => {
  try {
    const currentSlug = String(req.params.slug || "").trim();
    const payload = sanitizeSpeakerInvestorPayload(req.body);

    if (!payload.name || !payload.designation) {
      return res.status(400).json({ message: "name and designation are required." });
    }

    if (payload.slug && payload.slug !== currentSlug) {
      const duplicate = await SpeakerInvestorProfile.findOne({ slug: payload.slug }).lean();
      if (duplicate) {
        return res.status(409).json({ message: "A speaker/investor with this slug already exists." });
      }
    }

    const profile = await SpeakerInvestorProfile.findOneAndUpdate({ slug: currentSlug }, payload, { new: true });

    if (!profile) {
      return res.status(404).json({ message: "Speaker/investor profile not found." });
    }

    await deleteCache("public:speaker-investors", "admin:speaker-investors");
    return res.status(200).json({ message: "Speaker/investor profile updated successfully.", profile });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminSpeakerInvestorProfile = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "").trim();
    const profile = await SpeakerInvestorProfile.findOneAndDelete({ slug });

    if (!profile) {
      return res.status(404).json({ message: "Speaker/investor profile not found." });
    }

    await deleteCache("public:speaker-investors", "admin:speaker-investors");
    return res.status(200).json({ message: "Speaker/investor profile deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

export const createAdminPartnerLogo = async (req, res, next) => {
  try {
    // Only log POST requests and include method + headers for debugging
    // eslint-disable-next-line no-console
    if (String(req.method || '').toUpperCase() !== 'POST') {
      // ignore non-POSTs (e.g., OPTIONS preflight)
    } else {
      try {
        const safeHeaders = {
          origin: req.get && req.get('origin'),
          referer: req.get && req.get('referer'),
          'user-agent': req.get && req.get('user-agent'),
        };
        // eslint-disable-next-line no-console
        console.log('[DEBUG] createAdminPartnerLogo - method:', req.method, 'headers:', JSON.stringify(safeHeaders), 'body:', JSON.stringify(req.body));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('[DEBUG] createAdminPartnerLogo - req logging failed', e?.message || e);
      }
    }

    // If body is empty, return early with clear message (helps clients)
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body is empty.' });
    }
    const payload = sanitizePartnerPayload(req.body);

    // Attach metadata about who created this partner and request info
    try {
      payload.metadata = payload.metadata || {};
      payload.metadata.createdBy = req.user?.sub || req.user?.id || null;
      payload.metadata.createdByEmail = req.user?.email || null;
      payload.metadata.ip = req.ip || (req.connection && req.connection.remoteAddress) || null;
      payload.metadata.userAgent = req.get && req.get('user-agent') ? req.get('user-agent') : null;
      payload.metadata.createdAt = new Date();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Unable to attach partner metadata', e?.message || e);
    }

    if (!payload.name) {
      return res.status(400).json({ message: "name is required." });
    }

    const partner = await PartnerLogo.create(payload);
    await deleteCache("public:partners", "admin:partners");
    return res.status(201).json({ message: "Partner added successfully.", partner });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminPartnerLogo = async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    const payload = sanitizePartnerPayload(req.body);
    // Attach updater metadata
    try {
      payload.metadata = payload.metadata || {};
      payload.metadata.updatedBy = req.user?.sub || req.user?.id || null;
      payload.metadata.updatedByEmail = req.user?.email || null;
      payload.metadata.updatedAt = new Date();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Unable to attach partner update metadata', e?.message || e);
    }

    const partner = await PartnerLogo.findByIdAndUpdate(id, payload, { new: true });

    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    await deleteCache("public:partners", "admin:partners");
    return res.status(200).json({ message: "Partner updated successfully.", partner });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdminPartnerLogo = async (req, res, next) => {
  try {
    const id = String(req.params.id || "").trim();
    const partner = await PartnerLogo.findByIdAndDelete(id);

    if (!partner) {
      return res.status(404).json({ message: "Partner not found." });
    }

    await deleteCache("public:partners", "admin:partners");
    return res.status(200).json({ message: "Partner deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

export const updateAdminSiteNotice = async (req, res, next) => {
  try {
    const payload = sanitizeSiteNoticePayload(req.body);

    if (payload.isActive && !payload.message) {
      return res.status(400).json({ message: "message is required for an active popup notice." });
    }

    const notice = await SiteNotice.findOneAndUpdate(
      { key: SITE_NOTICE_KEY },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await deleteCache("public:site-notice", "admin:site-notice");
    return res.status(200).json({ message: "Site notice updated successfully.", notice });
  } catch (error) {
    return next(error);
  }
};
