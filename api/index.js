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

    // Initialize MongoDB connection if not ready
    if (!mongoReady && !mongoError) {
      try {
        console.log('Initializing MongoDB connection...');
        await connectMongo();
        mongoReady = true;
        console.log('MongoDB connected successfully');
      } catch (error) {
        console.error('MongoDB connection failed:', error);
        mongoError = error;
        return res.status(500).json({
          message: "Database connection failed",
          error: error?.message || "Unknown database error",
          timestamp: new Date().toISOString()
        });
      }
    }

    // If MongoDB failed previously, return error
    if (mongoError) {
      return res.status(500).json({
        message: "Database connection failed",
        error: mongoError.message,
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
