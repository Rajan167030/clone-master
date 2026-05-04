import { Account, Dashboard, EventInterest } from "../models/index.js";

const EVENT_REGISTRATIONS_KEY = "eventRegistrations";

const humanizeSlug = (slug) =>
  String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const sanitizeRegistration = (registration = {}) => ({
  slug: String(registration.slug || "").trim(),
  title: String(registration.title || "").trim(),
  subtitle: String(registration.subtitle || "").trim(),
  dateLabel: String(registration.dateLabel || "").trim(),
  locationLabel: String(registration.locationLabel || "").trim(),
  ticketLabel: String(registration.ticketLabel || "").trim(),
  status: String(registration.status || "registered").trim(),
  note: String(registration.note || "").trim(),
  registeredAt: registration.registeredAt ? new Date(registration.registeredAt) : new Date(),
  updatedAt: registration.updatedAt ? new Date(registration.updatedAt) : new Date(),
});

const getRegistrations = (account) => {
  const registrations = account?.metadata?.[EVENT_REGISTRATIONS_KEY];
  if (!Array.isArray(registrations)) {
    return [];
  }

  return registrations
    .map((item) => sanitizeRegistration(item))
    .filter((item) => item.slug && item.title);
};

const buildSummary = (registrations) => {
  const registeredCount = registrations.length;
  const attendedCount = registrations.filter((item) => item.status === "attended").length;
  const notedCount = registrations.filter((item) => item.note).length;
  const latestRegistration =
    registrations
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] || null;

  return {
    registeredCount,
    attendedCount,
    notedCount,
    latestRegistration,
  };
};

const syncDashboardEventSummary = async (account, registrations) => {
  if (!["user", "investor", "founder"].includes(account.role)) {
    return;
  }

  const dashboard = await Dashboard.findOne({ accountId: account._id, role: account.role });
  if (!dashboard) {
    return;
  }

  const summary = buildSummary(registrations);
  dashboard.widgetsData = {
    ...(dashboard.widgetsData || {}),
    eventParticipation: {
      summary,
      registrations: registrations.map((item) => ({
        ...item,
        registeredAt: item.registeredAt,
        updatedAt: item.updatedAt,
      })),
    },
  };
  dashboard.lastComputedAt = new Date();
  dashboard.markModified("widgetsData");
  await dashboard.save();
};

const getMyAccount = async (req) => {
  const accountId = req.user?.sub;
  if (!accountId) {
    return null;
  }

  return Account.findById(accountId);
};

export const getMyEventRegistrations = async (req, res, next) => {
  try {
    const account = await getMyAccount(req);
    if (!account) {
      return res.status(404).json({ message: "Authenticated account not found." });
    }

    const registrations = getRegistrations(account).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return res.status(200).json({
      registrations,
      summary: buildSummary(registrations),
    });
  } catch (error) {
    return next(error);
  }
};

export const registerForEvent = async (req, res, next) => {
  try {
    const account = await getMyAccount(req);
    if (!account) {
      return res.status(404).json({ message: "Authenticated account not found." });
    }

    const slug = String(req.params.slug || req.body?.slug || "").trim();
    const title = String(req.body?.title || "").trim() || humanizeSlug(slug) || "Event Registration";
    const subtitle = String(req.body?.subtitle || "").trim();
    const dateLabel = String(req.body?.dateLabel || "").trim() || "Date to be confirmed";
    const locationLabel = String(req.body?.locationLabel || "").trim() || "Location to be confirmed";
    const ticketLabel = String(req.body?.ticketLabel || "").trim();

    if (!slug) {
      return res.status(400).json({
        message: "slug is required to register for an event.",
      });
    }

    const registrations = getRegistrations(account);
    const existing = registrations.find((item) => item.slug === slug);

    if (existing) {
      existing.title = title;
      existing.subtitle = subtitle;
      existing.dateLabel = dateLabel;
      existing.locationLabel = locationLabel;
      existing.ticketLabel = ticketLabel;
      existing.updatedAt = new Date();
    } else {
      registrations.push(
        sanitizeRegistration({
          slug,
          title,
          subtitle,
          dateLabel,
          locationLabel,
          ticketLabel,
        }),
      );
    }

    account.metadata = {
      ...(account.metadata || {}),
      [EVENT_REGISTRATIONS_KEY]: registrations,
    };
    account.markModified("metadata");
    await account.save();
    await syncDashboardEventSummary(account, registrations);

    const registration = registrations.find((item) => item.slug === slug);

    return res.status(existing ? 200 : 201).json({
      message: existing
        ? "Event registration already exists. Details refreshed."
        : "Event registered successfully.",
      registration,
      summary: buildSummary(registrations),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateMyEventRegistration = async (req, res, next) => {
  try {
    const account = await getMyAccount(req);
    if (!account) {
      return res.status(404).json({ message: "Authenticated account not found." });
    }

    const slug = String(req.params.slug || "").trim();
    const note = typeof req.body?.note === "string" ? req.body.note.trim() : undefined;
    const status = typeof req.body?.status === "string" ? req.body.status.trim().toLowerCase() : undefined;

    const allowedStatus = new Set(["registered", "attended", "cancelled"]);
    if (status && !allowedStatus.has(status)) {
      return res.status(400).json({ message: "status must be registered, attended, or cancelled." });
    }

    const registrations = getRegistrations(account);
    const registration = registrations.find((item) => item.slug === slug);

    if (!registration) {
      return res.status(404).json({ message: "Event registration not found for this user." });
    }

    if (typeof note !== "undefined") {
      registration.note = note;
    }

    if (status) {
      registration.status = status;
    }

    registration.updatedAt = new Date();

    account.metadata = {
      ...(account.metadata || {}),
      [EVENT_REGISTRATIONS_KEY]: registrations,
    };
    account.markModified("metadata");
    await account.save();
    await syncDashboardEventSummary(account, registrations);

    return res.status(200).json({
      message: "Event participation updated successfully.",
      registration,
      summary: buildSummary(registrations),
    });
  } catch (error) {
    return next(error);
  }
};

export const submitEventInterest = async (req, res, next) => {
  try {
    const slug = String(req.params.slug || req.body?.slug || "").trim();
    const title = String(req.body?.title || "").trim();
    const fullName = String(req.body?.fullName || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const phone = String(req.body?.phone || "").trim();
    const city = String(req.body?.city || "").trim();
    const occupation = String(req.body?.occupation || "").trim();
    const startupName = String(req.body?.startupName || "").trim();
    const note = String(req.body?.note || "").trim();

    if (!slug || !title || !fullName || !email || !phone || !city) {
      return res.status(400).json({
        message: "slug, title, fullName, email, phone, and city are required.",
      });
    }

    const interest = await EventInterest.findOneAndUpdate(
      { slug, email },
      {
        slug,
        title,
        fullName,
        email,
        phone,
        city,
        occupation,
        startupName,
        note,
        status: "submitted",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    return res.status(201).json({
      message: "Event interest submitted successfully. Our team can review your request now.",
      interest: {
        id: interest._id,
        slug: interest.slug,
        title: interest.title,
        fullName: interest.fullName,
        email: interest.email,
        status: interest.status,
      },
    });
  } catch (error) {
    return next(error);
  }
};
