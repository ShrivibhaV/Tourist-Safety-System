import mongoose from "mongoose";

const SOSSchema = new mongoose.Schema({
  tourist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TouristRegistration",
    required: true
  },
  emergencyType: {
    type: String,
    enum: [
      "Medical Emergency",
      "Crime in Progress",
      "Accident",
      "Lost/Stranded",
      "Natural Disaster",
      "Threat to Life",
      "Other Emergency"
    ],
    required: true
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
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "Location must be [longitude, latitude]"
      }
    }
  },
  address: {
    type: String,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ["Active", "Responded", "Resolved", "False Alarm"],
    default: "Active"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Critical"
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PoliceOfficer" // For future police dashboard
  },
  responseTime: {
    type: Date // When first response was made
  },
  resolvedAt: {
    type: Date
  },
  contactAttempts: [{
    attemptedAt: { type: Date, default: Date.now },
    method: { type: String, enum: ["Call", "SMS", "App Notification"] },
    successful: { type: Boolean, default: false }
  }],
  nearbyOfficers: [{
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceOfficer"
    },
    notifiedAt: { type: Date, default: Date.now },
    distance: { type: Number } // in meters
  }],
  mediaAttachments: [{
    type: String, // URLs to images/videos
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Geospatial index for location-based queries
SOSSchema.index({ location: "2dsphere" });

// Compound indexes
SOSSchema.index({ status: 1, priority: 1, createdAt: -1 });
SOSSchema.index({ tourist: 1, status: 1 });
SOSSchema.index({ isActive: 1, status: 1 });

// Static method to find active SOS near a location (for dispatching officers)
SOSSchema.statics.findActiveNearLocation = function(longitude, latitude, maxDistance = 10000) {
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
    status: "Active",
    isActive: true
  }).sort({ priority: -1, createdAt: 1 });
};

// Method to mark as responded
SOSSchema.methods.markResponded = function(officerId) {
  this.status = "Responded";
  this.respondedBy = officerId;
  this.responseTime = new Date();
  return this.save();
};

// Method to mark as resolved
SOSSchema.methods.markResolved = function(notes) {
  this.status = "Resolved";
  this.resolvedAt = new Date();
  this.isActive = false;
  if (notes) this.notes = notes;
  return this.save();
};

// Method to add contact attempt
SOSSchema.methods.addContactAttempt = function(method, successful = false) {
  this.contactAttempts.push({
    method,
    successful,
    attemptedAt: new Date()
  });
  return this.save();
};

// Virtual for response duration (in minutes)
SOSSchema.virtual("responseDuration").get(function() {
  if (!this.responseTime) return null;
  return Math.floor((this.responseTime - this.createdAt) / (1000 * 60));
});

// Virtual for resolution duration (in minutes)
SOSSchema.virtual("resolutionDuration").get(function() {
  if (!this.resolvedAt) return null;
  return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60));
});

SOSSchema.set("toJSON", { virtuals: true });
SOSSchema.set("toObject", { virtuals: true });

export default mongoose.models.SOS ||
  mongoose.model("SOS", SOSSchema);