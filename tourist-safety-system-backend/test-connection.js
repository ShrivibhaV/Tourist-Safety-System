import dotenv from "dotenv";  // ← ADD THIS LINE
import { connectDB } from "./config/db.js";
import Alert from "./models/alert.model.js";
import TouristRegistration from "./models/tourist_register.model.js";

dotenv.config();  // ← ADD THIS LINE

const testConnection = async () => {
  try {
    console.log("🧪 Testing database connection and setup...\n");
    
    // Connect to database
    await connectDB();
    
    // Test 1: Count documents
    const alertCount = await Alert.countDocuments();
    console.log(`✅ Found ${alertCount} alerts in database`);
    
    const touristCount = await TouristRegistration.countDocuments();
    console.log(`✅ Found ${touristCount} tourists in database`);
    
    // Test 2: Test geospatial query
    console.log("\n🌍 Testing geospatial query...");
    const nearbyAlerts = await Alert.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [77.5946, 12.9716] // Bangalore
          },
          $maxDistance: 10000 // 10km
        }
      }
    }).limit(5);
    
    console.log(`✅ Geospatial query successful! Found ${nearbyAlerts.length} nearby alerts`);
    
    console.log("\n🎉 All tests passed! Your database is working perfectly!");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  } finally {
    process.exit(0);
  }
};

testConnection();