import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Alert title is required"],
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, "Alert description is required"],
    trim: true,
    maxlength: 500
  },
  alertType: {
    type: String,
    enum: [
      "Crime",
      "Natural Disaster",
      "Health Hazard",
      "Traffic",
      "Curfew",
      "Political Unrest",
      "Weather Warning",
      "General Safety"
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    required: true,
    default: "Medium"
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2 &&
            v.every(coord => typeof coord === "number"),
        message: "Location must be [longitude, latitude]"
      }
    }
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  radius: {
    type: Number, // in meters
    default: 1000,
    min: 100,
    max: 50000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: "Expiration date must be in the future"
    }
  },
  issuedBy: {
    type: String,
    enum: ["Police", "Government", "System", "Community"],
    default: "System"
  },
  affectedTourists: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

// Geospatial index for location-based queries
AlertSchema.index({ location: "2dsphere" });

// Compound indexes
AlertSchema.index({ alertType: 1, severity: 1, isActive: 1 });
AlertSchema.index({ expiresAt: 1, isActive: 1 });

// Static method to find active alerts near a location
AlertSchema.statics.findNearLocation = function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).sort({ severity: -1, createdAt: -1 });
};

// Method to check if alert is still valid
AlertSchema.methods.isValid = function() {
  return this.isActive && this.expiresAt > new Date();
};

// Auto-expire old alerts (can be called via cron job)
AlertSchema.statics.expireOldAlerts = async function() {
  return this.updateMany(
    { expiresAt: { $lt: new Date() }, isActive: true },
    { isActive: false }
  );
};

// Virtual for time remaining
AlertSchema.virtual("timeRemaining").get(function() {
  if (!this.isValid()) return 0;
  return Math.max(0, this.expiresAt - new Date());
});

AlertSchema.set("toJSON", { virtuals: true });
AlertSchema.set("toObject", { virtuals: true });

export default mongoose.models.Alert ||
  mongoose.model("Alert", AlertSchema);