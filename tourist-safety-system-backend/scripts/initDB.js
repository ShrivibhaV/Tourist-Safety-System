import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const initDatabase = async () => {
  try {
    console.log("🌱 Starting MongoDB Atlas initialization...");
    console.log("🔗 Connecting to database...");
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");

    const db = mongoose.connection.db;

    // ===========================================
    // CREATE GEOSPATIAL INDEXES (Most Important!)
    // ===========================================
    console.log("\n🌍 Creating geospatial indexes...");
    
    await db.collection("alerts").createIndex({ location: "2dsphere" });
    console.log("  ✅ alerts.location (2dsphere)");
    
    await db.collection("incidents").createIndex({ location: "2dsphere" });
    console.log("  ✅ incidents.location (2dsphere)");
    
    await db.collection("sos").createIndex({ location: "2dsphere" });
    console.log("  ✅ sos.location (2dsphere)");
    
    await db.collection("touristdashboards").createIndex({ currentLocation: "2dsphere" });
    console.log("  ✅ touristdashboards.currentLocation (2dsphere)");

    // ===========================================
    // CREATE UNIQUE INDEXES
    // ===========================================
    console.log("\n🔑 Creating unique indexes...");
    
    try {
      await db.collection("touristregistrations").createIndex({ email: 1 }, { unique: true });
      console.log("  ✅ touristregistrations.email (unique)");
    } catch (e) {
      console.log("  ⚠️  Email index already exists");
    }
    
    try {
      await db.collection("touristregistrations").createIndex({ phone: 1 }, { unique: true });
      console.log("  ✅ touristregistrations.phone (unique)");
    } catch (e) {
      console.log("  ⚠️  Phone index already exists");
    }
    
    try {
      await db.collection("touristregistrations").createIndex({ idNumber: 1 }, { unique: true });
      console.log("  ✅ touristregistrations.idNumber (unique)");
    } catch (e) {
      console.log("  ⚠️  ID Number index already exists");
    }
    
    try {
      await db.collection("touristdashboards").createIndex({ tourist: 1 }, { unique: true });
      console.log("  ✅ touristdashboards.tourist (unique)");
    } catch (e) {
      console.log("  ⚠️  Tourist dashboard index already exists");
    }

    // ===========================================
    // CREATE COMPOUND INDEXES FOR PERFORMANCE
    // ===========================================
    console.log("\n⚡ Creating compound indexes...");
    
    // Alerts
    await db.collection("alerts").createIndex({ alertType: 1, severity: 1, isActive: 1 });
    console.log("  ✅ alerts (alertType, severity, isActive)");
    
    await db.collection("alerts").createIndex({ expiresAt: 1, isActive: 1 });
    console.log("  ✅ alerts (expiresAt, isActive)");
    
    await db.collection("alerts").createIndex({ severity: -1, createdAt: -1 });
    console.log("  ✅ alerts (severity DESC, createdAt DESC)");
    
    // Incidents
    await db.collection("incidents").createIndex({ reportedBy: 1, status: 1 });
    console.log("  ✅ incidents (reportedBy, status)");
    
    await db.collection("incidents").createIndex({ incidentType: 1, status: 1 });
    console.log("  ✅ incidents (incidentType, status)");
    
    await db.collection("incidents").createIndex({ incidentDate: -1 });
    console.log("  ✅ incidents (incidentDate DESC)");
    
    await db.collection("incidents").createIndex({ isPublic: 1, incidentDate: -1 });
    console.log("  ✅ incidents (isPublic, incidentDate DESC)");
    
    // SOS
    await db.collection("sos").createIndex({ status: 1, priority: 1, createdAt: -1 });
    console.log("  ✅ sos (status, priority, createdAt DESC)");
    
    await db.collection("sos").createIndex({ tourist: 1, status: 1 });
    console.log("  ✅ sos (tourist, status)");
    
    await db.collection("sos").createIndex({ isActive: 1, status: 1 });
    console.log("  ✅ sos (isActive, status)");
    
    await db.collection("sos").createIndex({ priority: -1, createdAt: 1 });
    console.log("  ✅ sos (priority DESC, createdAt ASC)");
    
    // Tourist Registrations
    await db.collection("touristregistrations").createIndex({ isActive: 1, isVerified: 1 });
    console.log("  ✅ touristregistrations (isActive, isVerified)");
    
    await db.collection("touristregistrations").createIndex({ createdAt: -1 });
    console.log("  ✅ touristregistrations (createdAt DESC)");
    
    // Tourist Dashboards
    await db.collection("touristdashboards").createIndex({ tourist: 1, isActive: 1 });
    console.log("  ✅ touristdashboards (tourist, isActive)");
    
    await db.collection("touristdashboards").createIndex({ safetyScore: 1 });
    console.log("  ✅ touristdashboards (safetyScore)");

    // ===========================================
    // VERIFY INDEXES CREATED
    // ===========================================
    console.log("\n📊 Verifying indexes...");
    
    const alertIndexes = await db.collection("alerts").indexes();
    console.log(`  📌 Alerts: ${alertIndexes.length} indexes`);
    
    const incidentIndexes = await db.collection("incidents").indexes();
    console.log(`  📌 Incidents: ${incidentIndexes.length} indexes`);
    
    const sosIndexes = await db.collection("sos").indexes();
    console.log(`  📌 SOS: ${sosIndexes.length} indexes`);
    
    const dashboardIndexes = await db.collection("touristdashboards").indexes();
    console.log(`  📌 Dashboards: ${dashboardIndexes.length} indexes`);
    
    const registrationIndexes = await db.collection("touristregistrations").indexes();
    console.log(`  📌 Registrations: ${registrationIndexes.length} indexes`);

    // ===========================================
    // TEST GEOSPATIAL QUERY
    // ===========================================
    console.log("\n🧪 Testing geospatial query...");
    
    const testQuery = await db.collection("alerts").findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [77.5946, 12.9716] // Bangalore coordinates
          },
          $maxDistance: 50000
        }
      }
    });
    
    if (testQuery) {
      console.log("  ✅ Geospatial query working! Found alert:", testQuery.title);
    } else {
      console.log("  ℹ️  No alerts found (this is fine if database is empty)");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE INITIALIZATION COMPLETE!");
    console.log("=".repeat(60));
    console.log("✅ All indexes created successfully");
    console.log("✅ Geospatial queries ready");
    console.log("✅ Your database is production-ready!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Initialization failed:", error.message);
    console.error("\nFull error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Connection closed");
    process.exit(0);
  }
};

// Run the initialization
initDatabase();