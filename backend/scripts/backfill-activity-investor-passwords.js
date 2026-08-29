import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const NEW_PASSWORD = "sais2026";

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

const investors = await db.collection("activityinvestors").find({}).toArray();
for (const inv of investors) {
  await db.collection("activityinvestors").updateOne({ _id: inv._id }, { $set: { plainPassword: NEW_PASSWORD } });
  if (inv.accountId) {
    await db.collection("accounts").updateOne(
      { _id: inv.accountId },
      { $set: { passwordHash, updatedAt: new Date() } },
    );
  }
  console.log(`Updated: ${inv.fullName} <${inv.email}>`);
}

console.log(`\nDone. ${investors.length} activity investor(s) now use password "${NEW_PASSWORD}".`);

await mongoose.disconnect();
