import dotenv from "dotenv";
import mongoose from "mongoose";
import { PartnerType } from "../models/partner-type.model.js";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const seedPartnerTypes = [
  { name: "Media & Press", slug: "media-press", order: 10 },
  { name: "Event Sponsor", slug: "event-sponsor", order: 20 },
  { name: "Co-hosting Partner", slug: "cohosting-partner", order: 30 },
  { name: "Technology Partner", slug: "technology-partner", order: 40 },
  { name: "Community Partner", slug: "community-partner", order: 50 },
  { name: "College Partner", slug: "college-partner", order: 60 },
  { name: "Other", slug: "other", order: 999 },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  for (const t of seedPartnerTypes) {
    const existing = await PartnerType.findOne({ slug: t.slug });
    if (!existing) {
      await PartnerType.create({ ...t, isActive: true });
      console.log("Seeded partner type:", t.slug);
    } else {
      console.log("Partner type exists, skipping:", t.slug);
    }
  }

  await mongoose.disconnect();
  console.log("Partner types seed complete.");
};

seed().catch(async (err) => {
  console.error("Partner types seed failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
