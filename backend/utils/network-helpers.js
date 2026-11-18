import { Account, FounderProfile } from "../models/index.js";
import { STARTUP_STAGES } from "../models/network.model.js";

export const httpError = (status, message) => Object.assign(new Error(message), { status });
export const str = (v, max = 2000) => String(v ?? "").trim().slice(0, max);
export const strList = (v, max = 12, len = 40) =>
  [...new Set((Array.isArray(v) ? v : String(v || "").split(",")).map((x) => str(x, len)).filter(Boolean))].slice(0, max);
export const pickEnum = (v, values, fallback = "") => (values.includes(v) ? v : fallback);
export const pickEnumList = (v, values) => [...new Set((Array.isArray(v) ? v : []).filter((x) => values.includes(x)))];
export const isHttpUrl = (v) => !v || /^https?:\/\//i.test(v);
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export const meId = (req) => String(req.user?.id || req.user?.sub || "");
export const isAdminUser = (req) => req.user?.role === "admin" || req.user?.role === "superadmin";

export const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    if (error?.code === 11000) return res.status(409).json({ message: "That already exists." });
    return next(error);
  }
};

export const slugify = (value, fallback = "item") =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || fallback;

export const uniqueSlug = async (Model, wanted, fallback, exceptId) => {
  const base = slugify(wanted, fallback);
  let candidate = base;
  let n = 1;
  while (await Model.exists({ slug: candidate, ...(exceptId ? { _id: { $ne: exceptId } } : {}) })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
};

const STAGE_FROM_SIGNUP = {
  idea: "idea",
  ideation: "idea",
  mvp: "mvp",
  "pre-seed": "mvp",
  seed: "early_revenue",
  "early revenue": "early_revenue",
  growth: "growth",
  "series a": "growth",
  scaling: "scaling",
};

/** Returns the viewer's founder profile, creating one from their signup details on first use. */
export const ensureProfile = async (accountId) => {
  const existing = await FounderProfile.findOne({ accountId });
  if (existing) return existing;
  const account = await Account.findById(accountId).select("fullName city role roleDetails headline").lean();
  if (!account) throw httpError(404, "Account not found.");
  const rd = account.role === "founder" ? account.roleDetails || {} : {};
  const stage = STAGE_FROM_SIGNUP[String(rd.startupStage || "").toLowerCase()] || "";
  const slug = await uniqueSlug(FounderProfile, rd.startupName || account.fullName, "founder");
  try {
    return await FounderProfile.create({
      accountId,
      slug,
      startupName: str(rd.startupName, 120),
      website: isHttpUrl(rd.startupWebsite) ? str(rd.startupWebsite, 300) : "",
      teamSize: Number(rd.teamSize) > 0 ? Number(rd.teamSize) : 1,
      stage: STARTUP_STAGES.includes(stage) ? stage : "",
      city: str(account.city, 80),
      isListed: account.role === "founder",
    });
  } catch (error) {
    if (error?.code === 11000) return FounderProfile.findOne({ accountId });
    throw error;
  }
};

/** Public "person" cards for a set of account ids, joined with their founder profile. */
export const loadPeople = async (accountIds) => {
  const ids = [...new Set(accountIds.map(String))];
  if (!ids.length) return new Map();
  const [accounts, profiles] = await Promise.all([
    Account.find({ _id: { $in: ids } }).select("fullName role city headline profilePhoto profileId isActive").lean(),
    FounderProfile.find({ accountId: { $in: ids } }).select("accountId slug startupName logoUrl stage sectors role").lean(),
  ]);
  const byAccount = new Map(profiles.map((p) => [String(p.accountId), p]));
  return new Map(
    accounts.map((a) => {
      const p = byAccount.get(String(a._id));
      return [
        String(a._id),
        {
          id: String(a._id),
          fullName: a.fullName,
          role: a.role,
          city: a.city,
          headline: a.headline || p?.role || "",
          photo: a.profilePhoto || "",
          profileId: a.profileId || "",
          startupSlug: p?.slug || "",
          startupName: p?.startupName || "",
          startupLogo: p?.logoUrl || "",
          stage: p?.stage || "",
          sectors: p?.sectors || [],
        },
      ];
    }),
  );
};

export const unknownPerson = (id) => ({ id: String(id), fullName: "Former member", role: "user", city: "", headline: "", photo: "", profileId: "", startupSlug: "", startupName: "", startupLogo: "", stage: "", sectors: [] });
