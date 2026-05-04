import mongoose from "mongoose";

const DEFAULT_URI = "mongodb+srv://shivanshbyahut3_db_user:shiv13dsa@cluster0.umnpfsd.mongodb.net/";

let connectionPromise;

export const connectMongo = async (mongoUri = process.env.MONGODB_URI || DEFAULT_URI) => {
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
