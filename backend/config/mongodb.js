import mongoose from "mongoose";

let connectionPromise;

export const connectMongo = async (mongoUri = process.env.MONGODB_URI) => {
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set.");
  }

  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(mongoUri, {
      autoIndex: true,
      maxPoolSize: 20,  // Concurrency improve karega
      minPoolSize: 5,   // Minimum connections hamesha ready
      maxIdleTimeMS: 30000,  // Idle connections 30s baad close hoga
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    .then(() => mongoose.connection)
    .catch((error) => {
      connectionPromise = undefined;
      throw error;
    });

  return connectionPromise;
};

export const disconnectMongo = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    connectionPromise = undefined;
  }
};
