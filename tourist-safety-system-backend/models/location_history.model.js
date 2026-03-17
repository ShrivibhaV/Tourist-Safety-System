import mongoose from "mongoose";

const LocationHistorySchema = new mongoose.Schema({
    trackingSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LocationTracking",
        required: true,
        index: true
    },
    location: {
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
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    accuracy: {
        type: Number, // in meters
        min: 0,
        default: 0
    },
    speed: {
        type: Number, // in m/s
        min: 0,
        default: null
    },
    heading: {
        type: Number, // in degrees (0-360)
        min: 0,
        max: 360,
        default: null
    },
    altitude: {
        type: Number, // in meters
        default: null
    },
    battery: {
        type: Number, // percentage (0-100)
        min: 0,
        max: 100,
        default: null
    },
    address: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: false,
    versionKey: false
});

// Geospatial index
LocationHistorySchema.index({ location: "2dsphere" });

// Compound indexes for efficient queries
LocationHistorySchema.index({ trackingSession: 1, timestamp: -1 });

// TTL index: Auto-delete history after 30 days
LocationHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

// Static method to get location trail for a session
LocationHistorySchema.statics.getTrailForSession = function (sessionId, limit = 50) {
    return this.find({ trackingSession: sessionId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('location timestamp accuracy speed address');
};

// Static method to get latest location
LocationHistorySchema.statics.getLatestForSession = function (sessionId) {
    return this.findOne({ trackingSession: sessionId })
        .sort({ timestamp: -1 })
        .select('location timestamp accuracy address');
};

// Static method to cleanup old history
LocationHistorySchema.statics.cleanupOldHistory = function (daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.deleteMany({ timestamp: { $lt: cutoffDate } });
};

export default mongoose.models.LocationHistory ||
    mongoose.model("LocationHistory", LocationHistorySchema);
