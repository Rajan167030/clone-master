import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {
  Account,
  Dashboard,
  FounderAccount,
  InvestorAccount,
  UserAccount,
} from "../models/index.js";
import { getDashboardTemplate } from "../utils/dashboard-template.js";
import { buildDashboardPayload } from "../utils/dashboard-payload.js";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const SEED_PASSWORD = "TestPass123!";

const seedAccounts = [
  {
    fullName: "Demo User",
    email: "demo.user@startuplanes.local",
    phone: "9000000001",
    city: "Bengaluru",
    role: "user",
    roleDetails: {
      interest: "Networking, mentorship",
      occupation: "Software Engineer",
      experienceLevel: "intermediate",
    },
  },
  {
    fullName: "Demo Investor",
    email: "demo.investor@startuplanes.local",
    phone: "9000000002",
    city: "Mumbai",
    role: "investor",
    roleDetails: {
      investmentRange: {
        min: 500000,
        max: 2500000,
        currency: "INR",
      },
      focusSector: ["Fintech", "AI"],
      portfolioSize: 12,
      investorId: "INV-DEMO-001",
    },
  },
  {
    fullName: "Demo Founder",
    email: "demo.founder@startuplanes.local",
    phone: "9000000003",
    city: "Delhi",
    role: "founder",
    roleDetails: {
      startupName: "LaunchGrid",
      startupStage: "mvp",
      teamSize: 8,
      startupWebsite: "https://launchgrid.example.com",
    },
  },
];

const pickAccountModel = (role) => {
  if (role === "investor") return InvestorAccount;
  if (role === "founder") return FounderAccount;
  return UserAccount;
};

const generateReferralCode = (fullName) => {
  const base = String(fullName || "")
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, 4) || "user";

  return `${base}${Math.floor(100 + Math.random() * 900)}`;
};

const ensureDashboard = async (account) => {
  if (!["user", "investor", "founder"].includes(account.role)) {
    return { created: false, skipped: true };
  }

  const existingDashboard = await Dashboard.findOne({
    accountId: account._id,
    role: account.role,
  });

  if (existingDashboard) {
    return { created: false, skipped: false };
  }

  const template = getDashboardTemplate(account.role);
  const dashboardPayload = buildDashboardPayload({
    role: account.role,
    fullName: account.fullName,
    template,
  });

  await Dashboard.create({
    accountId: account._id,
    role: account.role,
    ...dashboardPayload,
  });

  return { created: true, skipped: false };
};

const seedAuthData = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const results = [];

  for (const seed of seedAccounts) {
    const normalizedEmail = seed.email.toLowerCase().trim();
    let account = await Account.findOne({ email: normalizedEmail });
    let accountCreated = false;

    if (!account) {
      const Model = pickAccountModel(seed.role);
      account = await Model.create({
        ...seed,
        email: normalizedEmail,
        passwordHash,
        referralCode: generateReferralCode(seed.fullName),
      });
      accountCreated = true;
    }

    const dashboardStatus = await ensureDashboard(account);

    results.push({
      email: normalizedEmail,
      role: seed.role,
      accountCreated,
      dashboardCreated: dashboardStatus.created,
      password: SEED_PASSWORD,
    });
  }

  const existingAccounts = await Account.find({});
  let backfilledDashboards = 0;

  for (const account of existingAccounts) {
    const dashboardStatus = await ensureDashboard(account);
    if (dashboardStatus.created) {
      backfilledDashboards += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        message: "Auth seed completed.",
        seededAccounts: results,
        backfilledDashboards,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
};

seedAuthData().catch(async (error) => {
  console.error("Auth seed failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
