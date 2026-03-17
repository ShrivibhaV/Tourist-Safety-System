import mongoose from "mongoose";

const LocationTrackingSchema = new mongoose.Schema({
    tourist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TouristRegistration",
        required: true,
        index: true
    },
    trackingId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    emergencyContactName: {
        type: String,
        required: true,
        trim: true
    },
    emergencyContactPhone: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    updateIntervalMinutes: {
        type: Number,
        default: 5,
        min: 1,
        max: 60
    },
    lastLocationUpdate: {
        type: Date,
        default: Date.now
    },
    currentLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point"
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            validate: {
                validator: (v) => Array.isArray(v) && v.length === 2,
                message: "Coordinates must be [longitude, latitude]"
            }
        }
    },
    currentAddress: {
        type: String,
        default: ""
    }
}, {
    timestamps: true,
    versionKey: false
});

// Geospatial index for location queries
LocationTrackingSchema.index({ currentLocation: "2dsphere" });

// Compound indexes
LocationTrackingSchema.index({ tourist: 1, isActive: 1 });
LocationTrackingSchema.index({ expiresAt: 1, isActive: 1 });

// Virtual for checking if session is expired
LocationTrackingSchema.virtual("isExpired").get(function () {
    return this.expiresAt < new Date();
});

// Virtual for time remaining in minutes
LocationTrackingSchema.virtual("minutesRemaining").get(function () {
    if (this.isExpired) return 0;
    return Math.max(0, Math.round((this.expiresAt - new Date()) / 60000));
});

// Method to check if session is still valid
LocationTrackingSchema.methods.isValid = function () {
    return this.isActive && !this.isExpired;
};

// Method to update location
LocationTrackingSchema.methods.updateLocation = function (longitude, latitude, address = "") {
    this.currentLocation = {
        type: "Point",
        coordinates: [longitude, latitude]
    };
    this.currentAddress = address;
    this.lastLocationUpdate = new Date();
    return this.save();
};

// Static method to find active tracking for tourist
LocationTrackingSchema.statics.findActiveForTourist = function (touristId) {
    return this.findOne({
        tourist: touristId,
        isActive: true,
        expiresAt: { $gt: new Date() }
    });
};

// Static method to expire old sessions
LocationTrackingSchema.statics.expireOldSessions = async function () {
    return this.updateMany(
        { expiresAt: { $lt: new Date() }, isActive: true },
        { isActive: false }
    );
};

// Pre-save: Auto-deactivate if expired
LocationTrackingSchema.pre("save", function (next) {
    if (this.isExpired && this.isActive) {
        this.isActive = false;
    }
    next();
});

LocationTrackingSchema.set("toJSON", { virtuals: true });
LocationTrackingSchema.set("toObject", { virtuals: true });

export default mongoose.models.LocationTracking ||
    mongoose.model("LocationTracking", LocationTrackingSchema);
