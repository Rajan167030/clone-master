import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config({ path: "backend/.env" });
dotenv.config();

// Fixed admin credentials
const ADMIN_EMAIL = "admin@foundersconnect.com";
const ADMIN_PASSWORD = "AdminPass123!";

await mongoose.connect(process.env.MONGODB_URI);

const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

await mongoose.connection.db.collection("accounts").updateOne(
  { email: ADMIN_EMAIL },
  {
    $set: {
      fullName: "Platform Admin",
      email: ADMIN_EMAIL,
      passwordHash,
      phone: "9000000010",
      city: "Bengaluru",
      role: "admin",
      referralCode: "admn101",
      roleDetails: {},
      dashboard: {
        stats: [],
        commitmentPortfolio: [],
        investmentPortfolio: [],
        widgets: {},
      },
      isActive: true,
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
      aiContext: {
        summary: "",
        tags: [],
        preferences: {},
        embeddingId: null,
      },
      metadata: {},
      lastLoginAt: null,
      __v: 0,
    },
  },
  { upsert: true },
);

const admin = await mongoose.connection.db.collection("accounts").findOne({ email: ADMIN_EMAIL });

console.log(
  JSON.stringify(
    {
      message: "Admin user seeded successfully.",
      email: admin.email,
      password: ADMIN_PASSWORD,
      role: admin.role,
    },
    null,
    2,
  ),
);

await mongoose.disconnect();
