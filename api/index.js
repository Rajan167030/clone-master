import app from "../backend/app.js";
import { connectMongo } from "../backend/config/mongodb.js";

let mongoReady = false;
let mongoError = null;

export default async function handler(req, res) {
  try {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Ensure MongoDB connection is active
    try {
      await connectMongo();
    } catch (dbErr) {
      console.error('MongoDB connection error in serverless handler:', dbErr);
      return res.status(500).json({
        message: "Database connection failed",
        error: dbErr?.message || "Database error",
        timestamp: new Date().toISOString()
      });
    }


    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error('API Handler Error:', error);
    return res.status(500).json({
      message: "Internal server error",
      error: error?.message || "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
}
