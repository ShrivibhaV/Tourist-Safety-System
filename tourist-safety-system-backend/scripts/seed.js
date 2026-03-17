import dotenv from "dotenv";
import mongoose from "mongoose";
import Alert from "../models/alert.model.js";
import TouristRegistration from "../models/tourist_register.model.js";
import TouristDashboard from "../models/tourist_dashboard.model.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing test data
    console.log("🗑️  Clearing existing test data...");
    await Alert.deleteMany({ title: /Test/ });
    await TouristRegistration.deleteMany({ email: /test.*@example\.com/ });
    console.log("✅ Cleared old test data");

    // Create test tourist
    console.log("\n👤 Creating test tourist...");
    const testTourist = await TouristRegistration.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.test@example.com",
      password: "Test@1234",
      phone: "9876543210",
      nationality: "United States",
      idType: "Passport",
      idNumber: "AB1234567",
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "9876543211"
    });
    console.log("✅ Test tourist created:", testTourist.email);

    // Create test dashboard
    console.log("\n📊 Creating test dashboard...");
    const testDashboard = await TouristDashboard.create({
      tourist: testTourist._id,
      currentLocation: {
        type: "Point",
        coordinates: [77.5946, 12.9716] // Bangalore, MG Road
      },
      safetyScore: 85,
      emergencyContacts: [
        {
          name: "Jane Doe",
          phone: "9876543211",
          relationship: "Family"
        }
      ]
    });
    console.log("✅ Test dashboard created");

    // Create test alerts
    console.log("\n🚨 Creating test alerts...");
    const testAlerts = await Alert.insertMany([
      {
        title: "Test Alert - Heavy Traffic",
        description: "Heavy traffic congestion on MG Road for testing purposes",
        alertType: "Traffic",
        severity: "Medium",
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716] // Bangalore, MG Road
        },
        address: "MG Road, Bangalore, Karnataka",
        radius: 2000,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        issuedBy: "Police"
      },
      {
        title: "Test Alert - Weather Warning",
        description: "Heavy rain expected in the next 3 hours",
        alertType: "Weather Warning",
        severity: "High",
        location: {
          type: "Point",
          coordinates: [77.6033, 12.9716] // Bangalore, Indiranagar
        },
        address: "Indiranagar, Bangalore, Karnataka",
        radius: 5000,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        issuedBy: "Government"
      },
      {
        title: "Test Alert - Safety Warning",
        description: "Reports of pickpocketing in crowded areas",
        alertType: "Crime",
        severity: "Medium",
        location: {
          type: "Point",
          coordinates: [77.5850, 12.9698] // Bangalore, Commercial Street
        },
        address: "Commercial Street, Bangalore, Karnataka",
        radius: 1000,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        issuedBy: "Police"
      }
    ]);
    console.log(`✅ Created ${testAlerts.length} test alerts`);

    // Test geospatial query
    console.log("\n🌍 Testing geospatial query...");
    const nearbyAlerts = await Alert.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [77.5946, 12.9716]
          },
          $maxDistance: 10000
        }
      }
    });
    console.log(`✅ Found ${nearbyAlerts.length} alerts near test location`);

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📝 Test Credentials:");
    console.log("   Email: john.test@example.com");
    console.log("   Password: Test@1234");
    console.log("\n📊 Test Data Created:");
    console.log(`   👤 Tourists: 1`);
    console.log(`   📊 Dashboards: 1`);
    console.log(`   🚨 Alerts: ${testAlerts.length}`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("\n❌ Seeding failed:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Connection closed");
    process.exit(0);
  }
};

seedDatabase();