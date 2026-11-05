// Seeds demo cohort programs and applications.
//   node scripts/seed-cohorts.js           -> insert/refresh demo data
//   node scripts/seed-cohorts.js --remove  -> delete all demo data
// Demo records are flagged (cohort.metadata.isDemo / application.isDemo) so real data is never touched.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Cohort } from "../models/cohort.model.js";
import { CohortApplication } from "../models/cohort-application.model.js";
import { deleteCache } from "../utils/cache.js";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const img = (id) => `https://images.unsplash.com/${id}?w=1200&q=80&fit=crop`;

const cohorts = [
  {
    title: "Founders Accelerator — Batch 07",
    slug: "founders-accelerator-batch-07",
    category: "startup",
    tagline: "For pre-seed & seed tech founders ready to raise",
    description:
      "A 10-week, operator-led accelerator for early-stage tech startups. Weekly sprints on product, GTM and fundraising, 1-on-1 office hours with operators who have scaled, and a closing Demo Day in front of 40+ active investors.",
    imageUrl: img("photo-1522071820081-009f0129c71c"),
    duration: "10 Weeks",
    mode: "Hybrid · Bengaluru & Remote",
    startDate: "January 2027",
    applicationDeadline: "15 Dec 2026",
    status: "Applications Open",
    seats: 20,
    fee: "Free · Zero equity",
    highlights: [
      "1-on-1 operator mentorship every week",
      "Demo Day with 40+ active VCs & angels",
      "$100K+ in cloud & SaaS credits",
      "Fundraising deck & data-room teardown",
    ],
    order: 1,
  },
  {
    title: "D2C Brand Scale-Up Program",
    slug: "d2c-brand-scale-up",
    category: "d2c",
    tagline: "Take your consumer brand from ₹1 Cr to ₹10 Cr ARR",
    description:
      "Built for D2C founders with early traction. Deep dives on performance marketing, unit economics, quick-commerce and marketplace distribution, retail expansion and supply chain — taught by founders of India's fastest-growing brands.",
    imageUrl: img("photo-1556740758-90de374c12ad"),
    duration: "8 Weeks",
    mode: "In-person · Mumbai",
    startDate: "February 2027",
    applicationDeadline: "10 Jan 2027",
    status: "Applications Open",
    seats: 15,
    fee: "Free · Zero equity",
    highlights: [
      "Performance marketing & CAC playbooks",
      "Q-commerce and marketplace onboarding",
      "Intro to D2C-focused funds",
      "Retail & distribution partner network",
    ],
    order: 2,
  },
  {
    title: "AI & SaaS Builders Cohort",
    slug: "ai-saas-builders",
    category: "startup",
    tagline: "Ship AI products enterprises will actually pay for",
    description:
      "A technical cohort for founders building AI-native and B2B SaaS products. Covers product-market fit for AI, enterprise sales, pricing, security reviews and global expansion, with mentors from leading SaaS companies.",
    imageUrl: img("photo-1531482615713-2afd69097998"),
    duration: "12 Weeks",
    mode: "Remote",
    startDate: "March 2027",
    applicationDeadline: "31 Jan 2027",
    status: "Early Applications",
    seats: 25,
    fee: "Free · Zero equity",
    highlights: [
      "Enterprise GTM & pricing workshops",
      "AI infra credits from partners",
      "Global SaaS mentor network",
      "Warm intros to B2B investors",
    ],
    order: 3,
  },
  {
    title: "Women Founders Fellowship",
    slug: "women-founders-fellowship",
    category: "general",
    tagline: "A peer-led fellowship for women building companies",
    description:
      "A six-week fellowship pairing women founders with mentors and a close peer group. Leadership, fundraising readiness, hiring your first team and building a support network that lasts beyond the program.",
    imageUrl: img("photo-1573164713988-8665fc963095"),
    duration: "6 Weeks",
    mode: "Hybrid · Delhi NCR",
    startDate: "December 2026",
    applicationDeadline: "25 Nov 2026",
    status: "Closing Soon",
    seats: 30,
    fee: "Free · Zero equity",
    highlights: [
      "Dedicated mentor for every fellow",
      "Fundraising readiness clinic",
      "Closed-door founder circles",
    ],
    order: 4,
  },
  {
    title: "Pre-Seed Founder Bootcamp",
    slug: "pre-seed-founder-bootcamp",
    category: "upcoming",
    tagline: "Go from idea to first customers in 4 weeks",
    description:
      "An intensive bootcamp for first-time founders still validating their idea. Customer discovery, MVP scoping, no-code prototyping and your first pitch — finishing with feedback from angels in our network.",
    imageUrl: img("photo-1552664730-d307ca884978"),
    duration: "4 Weeks",
    mode: "Remote",
    startDate: "April 2027",
    applicationDeadline: "",
    status: "Waitlist Open",
    seats: 40,
    fee: "Free · Zero equity",
    highlights: [
      "Customer discovery sprints",
      "MVP & no-code prototyping",
      "Angel feedback session",
    ],
    order: 5,
  },
];

const people = [
  ["Aarav Mehta", "Bengaluru", "FinLedger", "FinTech", "Seed", "8", "₹12 L", "₹1.5 Cr", "accepted", 9],
  ["Priya Nair", "Kochi", "LeafLoop", "Sustainability", "Pre-seed", "4", "₹2 L", "Bootstrapped", "shortlisted", 8],
  ["Rohan Gupta", "Delhi NCR", "MedRoute", "HealthTech", "Seed", "12", "₹20 L", "₹3 Cr", "interview", 8],
  ["Sneha Kulkarni", "Pune", "ShopKart Lite", "Retail Tech", "Pre-seed", "3", "Pre-revenue", "Bootstrapped", "reviewing", 6],
  ["Vikram Singh", "Jaipur", "AgriSense", "AgriTech", "Idea", "2", "Pre-revenue", "Bootstrapped", "new", null],
  ["Ananya Rao", "Hyderabad", "Kindly Skincare", "Beauty & Personal Care", "Seed", "15", "₹45 L", "₹2 Cr", "accepted", 9],
  ["Karan Malhotra", "Mumbai", "Brewhouse Coffee", "Food & Beverage", "Pre-seed", "6", "₹18 L", "₹50 L", "waitlisted", 7],
  ["Ishita Sharma", "Mumbai", "Threadly", "Fashion", "Seed", "10", "₹30 L", "₹1 Cr", "new", null],
  ["Arjun Iyer", "Chennai", "DocuMind AI", "AI / SaaS", "Seed", "9", "₹15 L", "₹2.5 Cr", "shortlisted", 8],
  ["Meera Joshi", "Bengaluru", "OpsPilot", "B2B SaaS", "Pre-seed", "5", "₹4 L", "₹40 L", "rejected", 4],
  ["Neha Verma", "Delhi NCR", "CareCircle", "ElderCare", "Pre-seed", "4", "₹3 L", "Bootstrapped", "accepted", 9],
  ["Fatima Shaikh", "Lucknow", "Stitchwise", "Creator Economy", "Idea", "2", "Pre-revenue", "Bootstrapped", "reviewing", 6],
  ["Dev Patel", "Ahmedabad", "QuickBite", "FoodTech", "Idea", "3", "Pre-revenue", "Bootstrapped", "new", null],
  ["Sara Thomas", "Bengaluru", "TutorNest", "EdTech", "Idea", "1", "Pre-revenue", "Bootstrapped", "new", null],
];

// Which demo cohort each person applied to (index into `cohorts`).
const cohortFor = [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4];

const pitchFor = (startup, industry) =>
  `${startup} is building a ${industry.toLowerCase()} product for India's next 100M users. We have early customers, a clear wedge and want the cohort to sharpen GTM and prepare for our next round.`;

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  const remove = process.argv.includes("--remove");

  const demoCohorts = await Cohort.find({ "metadata.isDemo": true }).select("slug").lean();
  await CohortApplication.deleteMany({ isDemo: true });
  await Cohort.deleteMany({ "metadata.isDemo": true });
  console.log(`Removed ${demoCohorts.length} demo cohorts and their demo applications.`);

  if (!remove) {
    for (const data of cohorts) {
      const clash = await Cohort.findOne({ slug: data.slug }).lean();
      if (clash) {
        console.log(`Skipping "${data.slug}" — a real cohort already uses this slug.`);
        continue;
      }
      await Cohort.create({ ...data, isActive: true, acceptingApplications: true, applicationUrl: "", metadata: { isDemo: true } });
    }

    const saved = await Cohort.find({ "metadata.isDemo": true }).lean();
    const bySlug = Object.fromEntries(saved.map((c) => [c.slug, c]));
    const now = Date.now();

    const apps = people
      .map(([founderName, city, startupName, industry, stage, teamSize, monthlyRevenue, fundingRaised, status, score], i) => {
        const cohort = bySlug[cohorts[cohortFor[i]].slug];
        if (!cohort) return null;
        const createdAt = new Date(now - (i * 2 + 1) * 24 * 60 * 60 * 1000);
        const history = [{ status: "new", note: "Application submitted", changedBy: "applicant", changedAt: createdAt }];
        if (status !== "new") {
          history.push({ status, note: "Demo status update", changedBy: "demo@foundersconnect", changedAt: new Date(createdAt.getTime() + 86400000) });
        }
        const handle = founderName.toLowerCase().replace(/\s+/g, ".");
        return {
          cohort: cohort._id,
          cohortSlug: cohort.slug,
          cohortTitle: cohort.title,
          founderName,
          email: `${handle}@demo.foundersconnect.co.in`,
          phone: `+91 98${String(10000000 + i * 734521).slice(0, 8)}`,
          city,
          linkedinUrl: `https://www.linkedin.com/in/${handle.replace(".", "-")}`,
          startupName,
          website: `https://${startupName.toLowerCase().replace(/[^a-z0-9]/g, "")}.example.com`,
          industry,
          stage,
          teamSize,
          monthlyRevenue,
          fundingRaised,
          pitch: pitchFor(startupName, industry),
          whyJoin: "Looking for operator mentorship, a strong peer group and investor access.",
          referralSource: ["LinkedIn", "Founders Connect event", "Friend / Referral", "Instagram"][i % 4],
          status,
          score,
          adminNotes: status === "new" ? "" : "Demo record — safe to delete.",
          statusHistory: history,
          isDemo: true,
          createdAt,
          updatedAt: createdAt,
        };
      })
      .filter(Boolean);

    await CohortApplication.insertMany(apps, { timestamps: false });
    console.log(`Inserted ${saved.length} demo cohorts and ${apps.length} demo applications.`);
  }

  await deleteCache(
    "public:cohorts",
    "public:cohorts:startup",
    "public:cohorts:d2c",
    "public:cohorts:general",
    "public:cohorts:upcoming",
    "admin:cohorts",
    ...cohorts.map((c) => `public:cohort:${c.slug}`)
  );
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
