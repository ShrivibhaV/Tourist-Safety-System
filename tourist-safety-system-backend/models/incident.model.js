import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TouristRegistration",
    required: true
  },
  incidentType: {
    type: String,
    enum: [
      "Theft",
      "Assault",
      "Fraud",
      "Lost Item",
      "Medical Emergency",
      "Accident",
      "Harassment",
      "Suspicious Activity",
      "Other"
    ],
    required: true
  },
  title: {
    type: String,
    required: [true, "Incident title is required"],
    trim: true,
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, "Incident description is required"],
    trim: true,
    minlength: 10,
    maxlength: 1000
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
  incidentDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: "Incident date cannot be in the future"
    }
  },
  severity: {
    type: String,
    enum: ["Minor", "Moderate", "Serious", "Critical"],
    default: "Moderate"
  },
  status: {
    type: String,
    enum: ["Pending", "Under Investigation", "Resolved", "Closed"],
    default: "Pending"
  },
  attachments: [{
    type: String, // URLs to images/documents
    trim: true
  }],
  witnesses: [{
    name: { type: String, trim: true },
    contact: { type: String, trim: true }
  }],
  policeReport: {
    filed: { type: Boolean, default: false },
    reportNumber: { type: String, trim: true },
    filedAt: { type: Date }
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PoliceOfficer" // For future police dashboard integration
  },
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isPublic: {
    type: Boolean,
    default: false // If true, can be shown to other tourists as safety info
  }
}, {
  timestamps: true,
  versionKey: false
});

// Geospatial index
IncidentSchema.index({ location: "2dsphere" });

// Compound indexes for queries
IncidentSchema.index({ reportedBy: 1, status: 1 });
IncidentSchema.index({ incidentType: 1, status: 1 });
IncidentSchema.index({ incidentDate: -1 });
IncidentSchema.index({ severity: 1, status: 1 });

// Static method to find incidents near a location
IncidentSchema.statics.findNearLocation = function(longitude, latitude, maxDistance = 5000) {
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
    isPublic: true
  }).sort({ incidentDate: -1 });
};

// Method to mark as resolved
IncidentSchema.methods.markResolved = function(notes) {
  this.status = "Resolved";
  this.resolutionNotes = notes;
  return this.save();
};

// Virtual for days since incident
IncidentSchema.virtual("daysSinceIncident").get(function() {
  return Math.floor((new Date() - this.incidentDate) / (1000 * 60 * 60 * 24));
});

IncidentSchema.set("toJSON", { virtuals: true });
IncidentSchema.set("toObject", { virtuals: true });

export default mongoose.models.Incident ||
  mongoose.model("Incident", IncidentSchema);