import mongoose from "mongoose";

// Sub-document schemas
const EmergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  phone: {
    type: String,
    match: [/^[1-9]\d{9,14}$/, "Invalid emergency phone"],
    required: true
  },
  relationship: {
    type: String,
    trim: true,
    maxlength: 30
  }
}, { _id: false });

const DashboardStatsSchema = new mongoose.Schema({
  resolvedIncidents: { type: Number, default: 0 },
  unresolvedIncidents: { type: Number, default: 0 },
  lastAlertSeen: { type: Date }
}, { _id: false });

// Main Dashboard Schema
const TouristDashboardSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TouristRegistration",
    required: true,
    unique: true // Each tourist has only one dashboard
  },
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2 &&
            v.every(coord => typeof coord === "number" && 
                   coord >= -180 && coord <= 180),
        message: "CurrentLocation must be [longitude, latitude] with valid coordinates"
      }
    }
  },
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  nearbyAlerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alert"
  }],
  incidentReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Incident"
  }],
  emergencyContacts: {
    type: [EmergencyContactSchema],
    validate: [arr => arr.length > 0, "At least one emergency contact is required"]
  },
  reportedSOS: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SOS"
  }],
  dashboardStats: {
    type: DashboardStatsSchema,
    default: () => ({})
  },
  preferences: {
    language: { type: String, default: "en", trim: true },
    receiveAlertNotifications: { type: Boolean, default: true },
    notificationRadius: { type: Number, default: 5000 } // meters
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  versionKey: false
});

// Geo index for efficient spatial queries (CRITICAL for location-based features)
TouristDashboardSchema.index({ currentLocation: "2dsphere" });

// Compound indexes for common queries
TouristDashboardSchema.index({ tourist: 1, isActive: 1 });
TouristDashboardSchema.index({ safetyScore: 1 });

// Virtual for quick contact retrieval
TouristDashboardSchema.virtual("primaryEmergencyContact").get(function() {
  return this.emergencyContacts && this.emergencyContacts.length ? this.emergencyContacts[0] : null;
});

// Method to update safety score
TouristDashboardSchema.methods.updateSafetyScore = function() {
  // Calculate based on nearby alerts and incidents
  const baseScore = 100;
  const alertPenalty = this.nearbyAlerts.length * 5;
  const incidentPenalty = this.dashboardStats.unresolvedIncidents * 10;
  
  this.safetyScore = Math.max(0, baseScore - alertPenalty - incidentPenalty);
  return this.safetyScore;
};

// Static method to find dashboards near a location
TouristDashboardSchema.statics.findNearby = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Hide sensitive details in JSON
TouristDashboardSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

TouristDashboardSchema.set("toObject", { virtuals: true });

export default mongoose.models.TouristDashboard ||
  mongoose.model("TouristDashboard", TouristDashboardSchema);