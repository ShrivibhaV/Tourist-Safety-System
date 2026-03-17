import mongoose from "mongoose";
import dotenv from "dotenv";
import TouristRegistration from "../models/tourist_register.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tourist_safety-system";

const clearDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const result = await TouristRegistration.deleteMany({});
        console.log(`🗑️ Deleted ${result.deletedCount} tourist registrations.`);

        process.exit(0);
    } catch (error) {
        console.error("❌ Error clearing database:", error);
        process.exit(1);
    }
};

clearDB();
