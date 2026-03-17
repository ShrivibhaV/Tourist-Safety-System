import mongoose from "mongoose";
import dotenv from "dotenv";
import Alert from "../models/alert.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tourist_safety-system";

// Risky zones database for popular Indian tourist locations
const riskyZones = [
    // === DELHI ===
    {
        title: "Yamuna River - Drowning Risk",
        description: "Yamuna River has strong currents and deep areas. Swimming is dangerous and prohibited in most sections. Flash floods possible during monsoon.",
        alertType: "Natural Disaster",
        severity: "High",
        location: { type: "Point", coordinates: [77.2500, 28.5355] }, // Yamuna near ITO
        address: "Yamuna River, Delhi",
        radius: 2000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        issuedBy: "System"
    },
    {
        title: "Ridge Forest Area - Wildlife Zone",
        description: "Dense forest area with wildlife including leopards, monkeys, and snakes. Stay on marked trails. Avoid after sunset.",
        alertType: "General Safety",
        severity: "Medium",
        location: { type: "Point", coordinates: [77.1925, 28.7041] }, // Delhi Ridge
        address: "Ridge Forest, North Delhi",
        radius: 3000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },

    // === MANALI (High Altitude) ===
    {
        title: "Rohtang Pass - High Altitude Warning",
        description: "Altitude sickness risk above 3900m. Symptoms: headache, nausea, fatigue. Descend immediately if severe. Carry oxygen.",
        alertType: "Health Hazard",
        severity: "Critical",
        location: { type: "Point", coordinates: [77.2490, 32.3720] }, // Rohtang Pass
        address: "Rohtang Pass, Manali, Himachal Pradesh",
        radius: 5000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },
    {
        title: "Beas River - Flash Flood Risk",
        description: "Sudden water release from upstream dam. Flash floods can occur without warning. Stay alert to sirens.",
        alertType: "Natural Disaster",
        severity: "Critical",
        location: { type: "Point", coordinates: [77.1892, 32.2396] }, // Beas River Manali
        address: "Beas River, Manali",
        radius: 1500,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },
    {
        title: "Solang Valley - Steep Terrain",
        description: "Steep slopes and cliffs. Avalanche risk in winter. Stay on designated paths. Hire local guides for trekking.",
        alertType: "General Safety",
        severity: "High",
        location: { type: "Point", coordinates: [77.1550, 32.3190] }, // Solang Valley
        address: "Solang Valley, Manali",
        radius: 4000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },

    // === BANGALORE ===
    {
        title: "Nandi Hills - Cliff Fall Hazard",
        description: "Steep cliffs with no barriers in some areas. Multiple accidents reported. Stay behind safety rails.",
        alertType: "General Safety",
        severity: "High",
        location: { type: "Point", coordinates: [77.6838, 13.3700] }, // Nandi Hills
        address: "Nandi Hills, Bangalore",
        radius: 2000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },
    {
        title: "Bannerghatta Forest - Wildlife Area",
        description: "Dense forest with leopards, elephants, and bears. Do not exit vehicle in safari area. Stay on marked trails.",
        alertType: "General Safety",
        severity: "Medium",
        location: { type: "Point", coordinates: [77.5760, 12.8005] }, // Bannerghatta
        address: "Bannerghatta National Park, Bangalore",
        radius: 5000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },

    // === GOA ===
    {
        title: "Arambol Beach - Riptide Warning",
        description: "Strong riptides during monsoon. Red flags indicate no swimming. Multiple drowning incidents. Lifeguards on duty 9 AM - 6 PM only.",
        alertType: "Natural Disaster",
        severity: "Critical",
        location: { type: "Point", coordinates: [73.7064, 15.6860] }, // Arambol Beach
        address: "Arambol Beach, Goa",
        radius: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },
    {
        title: "Dudhsagar Falls - Slippery Rocks",
        description: "Extremely slippery rocks near waterfall. Falls from height reported. Wear proper footwear. Do not climb on rocks.",
        alertType: "General Safety",
        severity: "High",
        location: { type: "Point", coordinates: [74.3144, 15.3140] }, // Dudhsagar Falls
        address: "Dudhsagar Falls, Goa",
        radius: 1500,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },

    // === SHIMLA ===
    {
        title: "Chail - High Altitude Zone",
        description: "Altitude 2250m. Mild altitude sickness possible. Carry warm clothing. Temperature drops sharply after sunset.",
        alertType: "Health Hazard",
        severity: "Medium",
        location: { type: "Point", coordinates: [77.1898, 30.9440] }, // Chail
        address: "Chail, Shimla, Himachal Pradesh",
        radius: 3000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },
    {
        title: "Chadwick Falls Trek - Dense Forest",
        description: "Dense forest area. Slippery trail during monsoon. Wild animals including bears spotted. Trek in groups only.",
        alertType: "General Safety",
        severity: "Medium",
        location: { type: "Point", coordinates: [77.1250, 31.0654] }, // Chadwick Falls
        address: "Chadwick Falls, Shimla",
        radius: 2000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },

    // === RISHIKESH ===
    {
        title: "Ganges River - Strong Current",
        description: "Ganges has very strong currents. Deep whirlpools in some areas. Wear life jackets for rafting. Swimming dangerous.",
        alertType: "Natural Disaster",
        severity: "High",
        location: { type: "Point", coordinates: [78.2676, 30.0869] }, // Rishikesh Ganges
        address: "Ganges River, Rishikesh, Uttarakhand",
        radius: 2500,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },
    {
        title: "Rajaji National Park - Elephant Corridor",
        description: "Wild elephant crossing area. Elephants can be aggressive. Do not honk or disturb. Maintain safe distance.",
        alertType: "General Safety",
        severity: "High",
        location: { type: "Point", coordinates: [78.1832, 30.0324] }, // Rajaji Park
        address: "Rajaji National Park, Rishikesh",
        radius: 8000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },

    // === MUMBAI ===
    {
        title: "Sanjay Gandhi National Park - Leopard Habitat",
        description: "Leopard sightings frequent. Do not trek alone or after dark. Keep children close. Report sightings to authorities.",
        alertType: "General Safety",
        severity: "High",
        location: { type: "Point", coordinates: [72.9114, 19.2183] }, // SGNP
        address: "Sanjay Gandhi National Park, Mumbai",
        radius: 6000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },
    {
        title: "Juhu Beach - Monsoon Warning",
        description: "High tides and strong waves during monsoon (June-Sept). Swimming prohibited. Coastal flooding possible.",
        alertType: "Weather Warning",
        severity: "Medium",
        location: { type: "Point", coordinates: [72.8264, 19.0990] }, // Juhu Beach
        address: "Juhu Beach, Mumbai",
        radius: 1500,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },

    // === LADAKH ===
    {
        title: "Khardung La Pass - Extreme Altitude",
        description: "World's highest motorable road at 5359m. Severe altitude sickness risk. Difficulty breathing, headaches common. Acclimatize properly.",
        alertType: "Health Hazard",
        severity: "Critical",
        location: { type: "Point", coordinates: [77.6034, 34.2677] }, // Khardung La
        address: "Khardung La Pass, Ladakh",
        radius: 3000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    },
    {
        title: "Pangong Lake - Sub-Zero Temperatures",
        description: "Temperature can drop to -30°C at night. Hypothermia risk. Limited medical facilities. Carry emergency supplies.",
        alertType: "Weather Warning",
        severity: "High",
        location: { type: "Point", coordinates: [78.6454, 33.7078] }, // Pangong Lake
        address: "Pangong Lake, Ladakh",
        radius: 5000,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        issuedBy: "System"
    }
];

const seedAlerts = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing system-generated alerts
        await Alert.deleteMany({ issuedBy: "System" });
        console.log("🗑️  Cleared existing system alerts");

        // Insert risky zones
        const result = await Alert.insertMany(riskyZones);
        console.log(`✅ Successfully seeded ${result.length} risky zone alerts!`);

        console.log("\n📍 Alert Zones Created:");
        console.log("==========================================");
        result.forEach((alert, index) => {
            console.log(`${index + 1}. ${alert.title} (${alert.severity})`);
            console.log(`   Location: ${alert.address}`);
            console.log(`   Type: ${alert.alertType}`);
            console.log(`   Radius: ${alert.radius}m\n`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding alerts:", error);
        process.exit(1);
    }
};

seedAlerts();
