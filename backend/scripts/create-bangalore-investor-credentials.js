import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Account, InvestorAccount, Dashboard } from "../models/index.js";
import { ActivityInvestor } from "../models/activity.model.js";
import { getDashboardTemplate } from "../utils/dashboard-template.js";
import { buildDashboardPayload } from "../utils/dashboard-payload.js";
import { validateAndNormalizeRoleDetails } from "../utils/role-details.js";
import { generateProfileId } from "../utils/profile-utils.js";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// List of investors for the Bangalore activity (SAIS'26). Each entry gets its own
// investor account with the exact password given here (not auto-generated).
// Fill this in, or point DATA_FILE at a JSON file with the same shape.
const INVESTORS = [
  // { fullName: "Jane Doe", email: "jane@example.vc", vcName: "Example Ventures", password: "SomePass123", phone: "", city: "Bangalore", sector: "" },
];

const DATA_FILE = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "data", "bangalore-investors.json");

const loadInvestors = () => {
  if (fs.existsSync(DATA_FILE)) {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    if (Array.isArray(raw) && raw.length) return raw;
  }
  return INVESTORS;
};

const generateInvestorId = () => `SAIS26-INV-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const generateReferralCode = (fullName) => {
  const base =
    String(fullName || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(0, 4) || "invr";
  return `${base}${Math.floor(100 + Math.random() * 900)}`;
};

const buildPlaceholderPhoto = (fullName) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || "Investor")}&background=8b5cf6&color=fff&size=256`;

const createOne = async ({ fullName, email, vcName, password, phone, city, sector }) => {
  const normalizedFullName = String(fullName || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedVcName = String(vcName || "").trim();
  const normalizedPhone = String(phone || "").trim() || "0000000000";
  const normalizedCity = String(city || "").trim() || "Bangalore";
  const normalizedSector = String(sector || "").trim() || "General";

  if (!normalizedFullName || !normalizedEmail || !normalizedVcName || !password) {
    throw new Error(`Skipping incomplete entry: ${JSON.stringify({ fullName, email, vcName })}`);
  }
  if (String(password).length < 8) {
    throw new Error(`Password too short (min 8 chars) for ${normalizedEmail}`);
  }

  const existing = await Account.findOne({ email: normalizedEmail });
  if (existing) {
    console.log(`SKIP (already exists): ${normalizedEmail}`);
    return { email: normalizedEmail, status: "already_exists" };
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const roleDetails = validateAndNormalizeRoleDetails("investor", {
    investmentRange: { min: 0, max: 0, currency: "INR" },
    focusSector: [normalizedSector],
    portfolioSize: 0,
    investorId: generateInvestorId(),
  });

  const dashboardTemplate = getDashboardTemplate("investor");

  const account = await InvestorAccount.create({
    fullName: normalizedFullName,
    email: normalizedEmail,
    passwordHash,
    phone: normalizedPhone,
    city: normalizedCity,
    role: "investor",
    profileId: generateProfileId(),
    headline: `${normalizedVcName} · SAIS'26`,
    referralCode: generateReferralCode(normalizedFullName),
    roleDetails,
    dashboard: {
      stats: dashboardTemplate.stats,
      commitmentPortfolio: dashboardTemplate.commitmentPortfolio,
      investmentPortfolio: dashboardTemplate.investmentPortfolio,
    },
  });

  const dashboardPayload = buildDashboardPayload({
    role: "investor",
    fullName: account.fullName,
    template: dashboardTemplate,
    roleDetails,
  });

  await Dashboard.create({
    accountId: account._id,
    role: "investor",
    ...dashboardPayload,
  });

  await ActivityInvestor.create({
    fullName: normalizedFullName,
    email: normalizedEmail,
    phone: normalizedPhone,
    firmName: normalizedVcName,
    designation: "Investor",
    sectors: [normalizedSector],
    photoUrl: buildPlaceholderPhoto(normalizedFullName),
    promoCodeUsed: "bangalore-activity-admin",
    accountId: account._id,
  });

  console.log(`CREATED: ${normalizedEmail} / ${password} (${normalizedVcName})`);
  return { email: normalizedEmail, password, vcName: normalizedVcName, status: "created" };
};

const run = async () => {
  const investors = loadInvestors();
  if (!investors.length) {
    console.log("No investors provided. Fill INVESTORS in this script, or pass a JSON file path as an argument.");
    return;
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const results = [];
  for (const entry of investors) {
    try {
      results.push(await createOne(entry));
    } catch (error) {
      console.error(error.message);
      results.push({ email: entry.email, status: "error", message: error.message });
    }
  }

  console.log("\n--- Summary ---");
  console.log(JSON.stringify(results, null, 2));

  await mongoose.disconnect();
};

await run();
