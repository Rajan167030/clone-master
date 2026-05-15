import { connectMongo } from "../config/mongodb.js";

// Serverless connection cache
let cachedConnection = null;

export const serverlessMongoConnect = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    cachedConnection = await connectMongo();
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    throw error;
  }
};

// Warm-up function for Vercel
export const warmUpDatabase = async () => {
  try {
    await serverlessMongoConnect();
    console.log("Database warmed up successfully");
  } catch (error) {
    console.error("Database warm-up failed:", error);
  }
};