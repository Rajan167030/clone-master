import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectMongo } from "./config/mongodb.js";

dotenv.config({ path: ".env" });
dotenv.config();

const { default: app } = await import("./app.js");

const PORT = Number(process.env.PORT || 4000);
const RETRY_MS = 5000;

const connectWithRetry = async () => {
  while (true) {
    try {
      const conn = await connectMongo();
      // eslint-disable-next-line no-console
      console.log("MongoDB connected successfully.");
      return conn;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("MongoDB connection failed. Retrying in 5s...", error?.message || error);
      await new Promise(resolve => setTimeout(resolve, RETRY_MS));
    }
  }
};

const start = async () => {
  const conn = await connectWithRetry();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server running on http://localhost:${PORT}`);
  });
};

start();
