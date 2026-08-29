import dotenv from "dotenv";
import mongoose from "mongoose";
import { ActivityInvestor } from "../models/activity.model.js";
import { Account } from "../models/index.js";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const email = String(process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.log("Usage: node backend/scripts/remove-activity-investor.js <email>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const investor = await ActivityInvestor.findOneAndDelete({ email });
if (!investor) {
  console.log(`Not found: ${email}`);
} else {
  if (investor.accountId) {
    await Account.updateOne(
      { _id: investor.accountId },
      { $set: { isActive: false, isProfilePublic: false } },
    );
  }
  console.log(`Removed: ${investor.fullName} <${investor.email}>`);
}

await mongoose.disconnect();
