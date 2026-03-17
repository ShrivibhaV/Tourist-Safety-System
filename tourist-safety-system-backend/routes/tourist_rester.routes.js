import express from "express";

// Controller-based CRUD imports
import {
  createTourist,
  getAllTourists,
  getTouristById,
  updateTourist,
  deleteTourist,
} from "../controllers/tourist_register.controller.js";

// Models for advanced features
import TouristRegistration from "../models/tourist_register.model.js";
import TouristDashboard from "../models/tourist_dashboard.model.js";
import Alert from "../models/alert.model.js";
import Incident from "../models/incident.model.js";
import SOS from "../models/sos.model.js";

const router = express.Router();
/* ============================================================
   📌 BASIC CRUD (Your controller-based clean endpoints)
   URL: /api/tourists
============================================================ */
router.post("/", createTourist);
router.get("/", getAllTourists);
router.get("/:id", getTouristById);
router.put("/:id", updateTourist);
router.delete("/:id", deleteTourist);

/* ============================================================
   📌 ADVANCED TOURIST SYSTEM (Auth, Dashboard, Alerts, SOS)
============================================================ */

/* ============================  
   TOURIST REGISTRATION (ADVANCED)
   URL: /api/tourists/register
=============================== */
router.post("/register", async (req, res) => {
  try {
    const tourist = await TouristRegistration.create(req.body);

    // Create dashboard for new tourist
    await TouristDashboard.create({
      tourist: tourist._id,
      currentLocation: {
        type: "Point",
        coordinates: req.body.coordinates || [0, 0],
      },
      emergencyContacts: [
        {
          name: req.body.emergencyContactName,
          phone: req.body.emergencyContactPhone,
          relationship: "Primary Contact",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Tourist registered successfully",
      data: { id: tourist._id, email: tourist.email },
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return res.status(400).json({
        success: false,
        message: `Duplicate entry: ${field} "${value}" already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(', ')}`
      });
    }

    // Generic error
    res.status(400).json({ success: false, message: error.message });
  }
});

/* ============================  
   LOGIN
   URL: /api/tourists/login
=============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const tourist = await TouristRegistration.findOne({ email }).select("+password");

    if (!tourist) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await tourist.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    tourist.lastLogin = new Date();
    await tourist.save();

    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: tourist._id,
        name: tourist.fullName,
        email: tourist.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ============================  
   GET TOURIST PROFILE
   URL: /api/tourists/:id
=============================== */
router.get("/profile/:id", async (req, res) => {
  try {
    const tourist = await TouristRegistration.findById(req.params.id);

    if (!tourist) {
      return res.status(404).json({ success: false, message: "Tourist not found" });
    }

    res.json({ success: true, data: tourist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ============================================================
   DASHBOARD
============================================================ */

// Get dashboard
router.get("/dashboard/:touristId", async (req, res) => {
  try {
    const dashboard = await TouristDashboard.findOne({ tourist: req.params.touristId })
      .populate("tourist", "firstName lastName email phone")
      .populate("nearbyAlerts")
      .populate("incidentReports")
      .populate("reportedSOS");

    if (!dashboard) {
      return res.status(404).json({ success: false, message: "Dashboard not found" });
    }

    res.json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update location
router.patch("/dashboard/:touristId/location", async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    const dashboard = await TouristDashboard.findOneAndUpdate(
      { tourist: req.params.touristId },
      {
        currentLocation: { type: "Point", coordinates: [longitude, latitude] },
      },
      { new: true }
    );

    const nearbyAlerts = await Alert.findNearLocation(longitude, latitude, 5000);

    dashboard.nearbyAlerts = nearbyAlerts.map((a) => a._id);
    dashboard.updateSafetyScore();
    await dashboard.save();

    res.json({
      success: true,
      message: "Location updated",
      data: {
        location: dashboard.currentLocation,
        safetyScore: dashboard.safetyScore,
        nearbyAlerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ============================================================
   ALERTS
============================================================ */

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).sort({ severity: -1, createdAt: -1 });

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/alerts/nearby", async (req, res) => {
  try {
    const { longitude, latitude, radius = 5000 } = req.query;

    const alerts = await Alert.findNearLocation(
      parseFloat(longitude),
      parseFloat(latitude),
      parseInt(radius)
    );

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ============================================================
   INCIDENTS
============================================================ */

router.post("/incidents", async (req, res) => {
  try {
    const incident = await Incident.create(req.body);

    await TouristDashboard.findOneAndUpdate(
      { tourist: req.body.reportedBy },
      { $push: { incidentReports: incident._id } }
    );

    res.status(201).json({
      success: true,
      message: "Incident reported",
      data: incident,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/incidents/tourist/:touristId", async (req, res) => {
  try {
    const incidents = await Incident.find({ reportedBy: req.params.touristId }).sort({
      incidentDate: -1,
    });

    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ============================================================
   SOS
============================================================ */

router.post("/sos", async (req, res) => {
  try {
    const sos = await SOS.create(req.body);

    await TouristDashboard.findOneAndUpdate(
      { tourist: req.body.tourist },
      { $push: { reportedSOS: sos._id } }
    );

    res.status(201).json({
      success: true,
      message: "SOS alert created",
      data: sos,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/sos/tourist/:touristId", async (req, res) => {
  try {
    const sosAlerts = await SOS.find({
      tourist: req.params.touristId,
      status: { $in: ["Active", "Responded"] },
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: sosAlerts.length, data: sosAlerts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch("/sos/:id/resolve", async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({ success: false, message: "SOS not found" });
    }

    await sos.markResolved(req.body.notes);

    res.json({
      success: true,
      message: "SOS resolved",
      data: sos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

