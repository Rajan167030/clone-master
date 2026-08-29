import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "backend/.env" });
dotenv.config();

const NEW_PASSWORD = "sais2026";

const EMAILS = [
  "sunil.cavale@specialeinvest.com",
  "nikhil@atomiccapital.in",
  "sam.agarwal@gmail.com",
  "rishav@picxele.com",
  "sridharsr@live.com",
  "sumit@unwindventures.com",
  "disha@allincapital.vc",
  "aarjav@allincapital.vc",
  "azhar@araliventures.in",
  "shramay@pavestone.vc",
  "saloni.chaturvedi@aumvc.com",
  "karan.bhargav@venturecatalysts.in",
  "a.pawan.kumar@gmail.com",
  "rg@aiaiyo.io",
  "rungta.ajay@gmail.com",
  "partner@gro8.club",
  "subramanian@subbu.co",
  "maniayush15@gmail.com",
];

await mongoose.connect(process.env.MONGODB_URI);

const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

const result = await mongoose.connection.db.collection("accounts").updateMany(
  { email: { $in: EMAILS } },
  { $set: { passwordHash, updatedAt: new Date() } },
);

console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

await mongoose.disconnect();
