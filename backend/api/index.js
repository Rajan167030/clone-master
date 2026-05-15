import app from "../app.js";
import { serverlessMongoConnect } from "../utils/serverless.js";

// Global connection cache for serverless
let mongoReady = false;
let connectionPromise = null;

export default async function handler(req, res) {
  // Set serverless-specific headers
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.setHeader('X-Serverless', 'true');

  // Ensure database connection
  if (!mongoReady) {
    if (!connectionPromise) {
      connectionPromise = serverlessMongoConnect()
        .then(() => {
          mongoReady = true;
          return true;
        })
        .catch((error) => {
          console.error("Database connection failed:", error);
          mongoReady = false;
          connectionPromise = null;
          throw error;
        });
    }

    try {
      await connectionPromise;
    } catch (error) {
      return res.status(500).json({
        message: "Database connection failed",
        error: process.env.NODE_ENV === 'development' ? error?.message : "Internal server error",
      });
    }
  }

  // Handle the request
  try {
    return app(req, res);
  } catch (error) {
    console.error("Request handler error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
}