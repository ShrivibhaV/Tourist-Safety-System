import express from 'express';
import LocationTracking from '../models/location_tracking.model.js';
import LocationHistory from '../models/location_history.model.js';
import TouristRegistration from '../models/tourist_register.model.js';
import crypto from 'crypto';

const router = express.Router();

// ==================== START TRACKING SESSION ====================
router.post('/start', async (req, res) => {
    try {
        const { touristId, duration, emergencyContactName, emergencyContactPhone } = req.body;

        if (!touristId || !duration || !emergencyContactName || !emergencyContactPhone) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Verify tourist exists
        const tourist = await TouristRegistration.findById(touristId);
        if (!tourist) {
            return res.status(404).json({
                success: false,
                message: 'Tourist not found'
            });
        }

        // Check if there's already an active session
        const existingSession = await LocationTracking.findActiveForTourist(touristId);
        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active tracking session',
                trackingId: existingSession.trackingId,
                trackingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${existingSession.trackingId}`
            });
        }

        // Generate unique tracking ID
        const trackingId = 'TRK-' + crypto.randomBytes(6).toString('hex').toUpperCase();

        // Calculate expiration time
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + duration);

        // Create tracking session
        const trackingSession = await LocationTracking.create({
            tourist: touristId,
            trackingId,
            emergencyContactName,
            emergencyContactPhone,
            startTime: new Date(),
            expiresAt,
            currentLocation: {
                type: 'Point',
                coordinates: [0, 0] // Will be updated with first GPS reading
            }
        });

        const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${trackingId}`;

        res.json({
            success: true,
            message: 'Location tracking started',
            data: {
                trackingId,
                trackingUrl,
                expiresAt,
                duration,
                emergencyContact: {
                    name: emergencyContactName,
                    phone: emergencyContactPhone
                }
            }
        });

    } catch (error) {
        console.error('Start tracking error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== UPDATE LOCATION ====================
router.post('/update/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;
        const { latitude, longitude, accuracy, speed, heading, altitude, battery, address } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        // Find tracking session
        const session = await LocationTracking.findOne({ trackingId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Tracking session not found'
            });
        }

        // Check if session is still valid
        if (!session.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Tracking session has expired or been stopped'
            });
        }

        // Update current location in tracking session
        await session.updateLocation(longitude, latitude, address || '');

        // Add to location history
        await LocationHistory.create({
            trackingSession: session._id,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            timestamp: new Date(),
            accuracy: accuracy || 0,
            speed: speed || null,
            heading: heading || null,
            altitude: altitude || null,
            battery: battery || null,
            address: address || ''
        });

        res.json({
            success: true,
            message: 'Location updated successfully',
            data: {
                timestamp: new Date(),
                minutesRemaining: session.minutesRemaining
            }
        });

    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== VIEW TRACKING (PUBLIC) ====================
router.get('/view/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;

        // Find tracking session
        const session = await LocationTracking.findOne({ trackingId })
            .populate('tourist', 'firstName lastName');

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Tracking session not found'
            });
        }

        // Get location history
        const locationHistory = await LocationHistory.getTrailForSession(session._id, 100);

        // Format response
        const response = {
            success: true,
            data: {
                touristName: `${session.tourist.firstName} ${session.tourist.lastName}`,
                emergencyContact: session.emergencyContactName,
                isActive: session.isActive,
                isExpired: session.isExpired,
                currentLocation: {
                    latitude: session.currentLocation.coordinates[1],
                    longitude: session.currentLocation.coordinates[0],
                    address: session.currentAddress || 'Location not available yet',
                    lastUpdate: session.lastLocationUpdate
                },
                locationHistory: locationHistory.map(loc => ({
                    latitude: loc.location.coordinates[1],
                    longitude: loc.location.coordinates[0],
                    timestamp: loc.timestamp,
                    accuracy: loc.accuracy,
                    speed: loc.speed,
                    address: loc.address
                })),
                sessionInfo: {
                    startTime: session.startTime,
                    expiresAt: session.expiresAt,
                    minutesRemaining: session.minutesRemaining,
                    updateInterval: session.updateIntervalMinutes
                }
            }
        };

        res.json(response);

    } catch (error) {
        console.error('View tracking error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== STOP TRACKING ====================
router.post('/stop/:trackingId', async (req, res) => {
    try {
        const { trackingId } = req.params;
        const { touristId } = req.body;

        // Find tracking session
        const session = await LocationTracking.findOne({ trackingId });
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Tracking session not found'
            });
        }

        // Verify tourist owns this session
        if (touristId && session.tourist.toString() !== touristId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to stop this tracking session'
            });
        }

        // Deactivate session
        session.isActive = false;
        await session.save();

        res.json({
            success: true,
            message: 'Tracking stopped successfully'
        });

    } catch (error) {
        console.error('Stop tracking error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== GET ACTIVE TRACKING FOR TOURIST ====================
router.get('/active/:touristId', async (req, res) => {
    try {
        const { touristId } = req.params;

        const session = await LocationTracking.findActiveForTourist(touristId);

        if (!session) {
            return res.json({
                success: true,
                hasActiveTracking: false,
                data: null
            });
        }

        const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/${session.trackingId}`;

        res.json({
            success: true,
            hasActiveTracking: true,
            data: {
                trackingId: session.trackingId,
                trackingUrl,
                emergencyContact: {
                    name: session.emergencyContactName,
                    phone: session.emergencyContactPhone
                },
                startTime: session.startTime,
                expiresAt: session.expiresAt,
                minutesRemaining: session.minutesRemaining,
                lastUpdate: session.lastLocationUpdate
            }
        });

    } catch (error) {
        console.error('Get active tracking error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ==================== CLEANUP EXPIRED SESSIONS (CRON JOB) ====================
router.post('/cleanup', async (req, res) => {
    try {
        const result = await LocationTracking.expireOldSessions();

        res.json({
            success: true,
            message: 'Cleanup completed',
            expiredSessions: result.modifiedCount
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
