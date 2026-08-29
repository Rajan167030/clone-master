// One-off migration: the founder registration form's description field limit was
// lowered from 250 words to 100 words. Startups that registered before this change
// may still have descriptions longer than 100 words — this truncates those in place.
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const MAX_WORDS = 100;

const words = (s) => s.trim().split(/\s+/).filter(Boolean);

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const startups = await db
  .collection("activitystartups")
  .find({}, { projection: { startupName: 1, description: 1 } })
  .toArray();

let updated = 0;
for (const startup of startups) {
  const wordList = words(startup.description || "");
  if (wordList.length <= MAX_WORDS) continue;

  const truncated = wordList.slice(0, MAX_WORDS).join(" ");
  await db
    .collection("activitystartups")
    .updateOne({ _id: startup._id }, { $set: { description: truncated } });

  console.log(`${startup.startupName}: ${wordList.length} -> ${MAX_WORDS} words`);
  updated += 1;
}

console.log(`\nDone. Truncated ${updated} of ${startups.length} startup descriptions.`);
await mongoose.disconnect();
