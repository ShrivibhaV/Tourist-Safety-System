import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

// Load environment variables
dotenv.config();

// Correct model imports
import Alert from "./models/alert.model.js";
import Incident from "./models/incident.model.js";
import SOS from "./models/sos.model.js";
import TouristDashboard from "./models/tourist_dashboard.model.js";
import TouristProfile from "./models/tourist_profile.model.js";
import TouristRegister from "./models/tourist_register.model.js";

// Database connection
const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tourist_safety-system";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`✨ CORS enabled for: http://localhost:3000, http://localhost:3001`);
      console.log(`📍 Test: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
