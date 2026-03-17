import mongoose from "mongoose";

const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  family: 4,
  retryWrites: true,
  retryReads: true,
  compressors: "zlib",
  readPreference: "primaryPreferred",
  w: "majority",
  wtimeoutMS: 2500,
  journal: true,
  autoIndex: true,
  autoCreate: true
};

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("📦 Using existing MongoDB connection");
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(MONGODB_URI, options);

    isConnected = conn.connections[0].readyState === 1;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    mongoose.connection.on("connected", () => {
      console.log("🟢 Mongoose connected to MongoDB Atlas");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ Mongoose connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🔴 Mongoose disconnected from MongoDB");
      isConnected = false;
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🛑 MongoDB connection closed through app termination");
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    isConnected = false;
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log("🔌 MongoDB disconnected successfully");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error.message);
    throw error;
  }
};

export default { connectDB, disconnectDB };