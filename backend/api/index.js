import app from "../app.js";
import { connectMongo } from "../config/mongodb.js";

let mongoReady = false;

export default async function handler(req, res) {
  if (!mongoReady) {
    try {
      await connectMongo();
      mongoReady = true;
    } catch (error) {
      return res.status(500).json({
        message: "Database connection failed",
        error: error?.message || "Unknown error",
      });
    }
  }

  return app(req, res);
}