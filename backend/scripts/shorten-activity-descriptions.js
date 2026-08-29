import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const wc = (s) => s.trim().split(/\s+/).filter(Boolean).length;

const coffeeBondDesc = `Coffee Bond is building neighbourhood infrastructure for India's daily coffee habit — all-day cafés, corporate kiosks, and packaged products, backed by centralized roasting, bakery production, and quality control.

We serve urban professionals, students, and neighbourhood communities seeking premium coffee, food, and workspace close to home and work, at lower cost than high-street café chains.

We currently run 4 cafés and 18 corporate kiosks, generating ₹6.3 crore in annualized revenue — our leading café alone earns ₹21–22 lakh/month at a 72% gross margin. We're raising $1 million to build and prove our first dense NCR cluster.`;

const nuePrismDesc = `NuePrism is an AI-enabled Execution Verdict System for software delivery. It continuously analyzes execution data from tools like Jira to surface emerging delivery risks, explain the evidence and root causes, and recommend role-specific interventions — before issues surface through conventional dashboards.

Unlike dashboards that just report metrics, NuePrism delivers execution judgment: what's at risk, why it's happening, and where to intervene. It's built for engineering leaders, TPMs, and delivery leaders responsible for predictable software outcomes.`;

console.log("Coffee Bond new word count:", wc(coffeeBondDesc));
console.log("NuePrism new word count:", wc(nuePrismDesc));

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

await db.collection("activitystartups").updateOne(
  { startupName: { $regex: /coffee ?bond/i } },
  { $set: { description: coffeeBondDesc } },
);
await db.collection("activitystartups").updateOne(
  { startupName: { $regex: /nueprism/i } },
  { $set: { description: nuePrismDesc } },
);

console.log("Updated both descriptions.");
await mongoose.disconnect();
