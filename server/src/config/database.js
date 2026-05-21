import mongoose from "mongoose";

export const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.info("MongoDB is not configured. API will use local JSON storage.");
    return false;
  }

  try {
    await mongoose.connect(uri);
    console.info("MongoDB connected.");
    return true;
  } catch (error) {
    console.warn("MongoDB connection failed. API will use local JSON storage.");
    console.warn(error.message);
    return false;
  }
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
