import mongoose from "mongoose";
import { Account } from "./models/index.js";
import dotenv from "dotenv";
dotenv.config();

async function findAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await Account.findOne({ role: "admin" }).lean();
  console.log("Admin User:", JSON.stringify(admin, null, 2));
  process.exit(0);
}

findAdmin();
