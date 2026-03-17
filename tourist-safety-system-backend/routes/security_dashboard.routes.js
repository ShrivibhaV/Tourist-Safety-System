// Security Dashboard API Routes
// Provides data for police/security personnel dashboard

import express from 'express';
import Tourist from '../models/tourist_register.model.js';
import Incident from '../models/incident.model.js';
import TouristDashboard from '../models/tourist_dashboard.model.js';

const router = express.Router();

// ==================== GET SECURITY DASHBOARD STATS ====================
router.get('/stats', async (req, res) => {
    try {
        // Get total tourist count
        const totalTourists = await Tourist.countDocuments();

        // Get active tourists (those with dashboard records and recent activity)
        const activeTourists = await TouristDashboard.countDocuments({
            lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Active in last 24h
        });

        // Get incident statistics
        const totalIncidents = await Incident.countDocuments();
        const openIncidents = await Incident.countDocuments({
            status: { $in: ['reported', 'investigating'] }
        });
        const resolvedIncidents = await Incident.countDocuments({
            status: 'resolved'
        });
        const criticalIncidents = await Incident.countDocuments({
            severity: 'critical',
            status: { $ne: 'resolved' }
        });

        // Calculate average safety score
        const dashboards = await TouristDashboard.find({}, 'safetyScore');
        const avgSafetyScore = dashboards.length > 0
            ? Math.round(dashboards.reduce((sum, d) => sum + (d.safetyScore || 0), 0) / dashboards.length)
            : 0;

        // Get recent incident response times (simplified - you could track this more precisely)
        const recentIncidents = await Incident.find({
            status: 'resolved',
            resolvedAt: { $exists: true }
        })
            .sort({ resolvedAt: -1 })
            .limit(50);

        const avgResponseTime = recentIncidents.length > 0
            ? recentIncidents.reduce((sum, inc) => {
                const responseTime = inc.resolvedAt
                    ? (new Date(inc.resolvedAt) - new Date(inc.timestamp)) / (1000 * 60)
                    : 0;
                return sum + responseTime;
            }, 0) / recentIncidents.length
            : 0;

        res.json({
            success: true,
            data: {
                totalTourists,
                activeTourists,
                totalIncidents,
                openIncidents,
                resolvedIncidents,
                criticalAlerts: criticalIncidents,
                safetyScore: avgSafetyScore,
                averageResponseTime: Math.round(avgResponseTime * 10) / 10 // Round to 1 decimal
            }
        });
    } catch (error) {
        console.error('Security stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== GET ALL INCIDENTS (with filters) ====================
router.get('/incidents', async (req, res) => {
    try {
        const { status, severity, search, limit = 50 } = req.query;

        // Build query
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (severity) {
            query.severity = severity;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const incidents = await Incident.find(query)
            .populate('reportedBy', 'firstName lastName email phoneNumber')
            .sort({ createdAt: -1 }) // Use createdAt instead of timestamp
            .limit(parseInt(limit));

        // Format response
        const formattedIncidents = incidents.map(inc => ({
            id: inc._id,
            touristId: inc.reportedBy?._id,
            touristName: inc.reportedBy ? `${inc.reportedBy.firstName} ${inc.reportedBy.lastName}` : 'Unknown',
            touristPhone: inc.reportedBy?.phoneNumber,
            type: inc.incidentType,
            severity: inc.severity,
            status: inc.status,
            title: inc.title,
            description: inc.description,
            location: inc.address || 'Location not specified', // Use address string instead of GeoJSON
            coordinates: inc.location?.coordinates || null,
            timestamp: inc.createdAt || inc.incidentDate,
            assignedOfficer: inc.assignedOfficer || null,
            evidence: inc.attachments || []
        }));

        res.json({
            success: true,
            data: formattedIncidents,
            count: formattedIncidents.length
        });
    } catch (error) {
        console.error('Get incidents error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== GET SINGLE INCIDENT ====================
router.get('/incidents/:id', async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate('reportedBy', 'firstName lastName email phoneNumber digitalIdentityHash');

        if (!incident) {
            return res.status(404).json({ success: false, message: 'Incident not found' });
        }

        res.json({
            success: true,
            data: {
                id: incident._id,
                touristId: incident.reportedBy?._id,
                touristName: incident.reportedBy ? `${incident.reportedBy.firstName} ${incident.reportedBy.lastName}` : 'Unknown',
                touristPhone: incident.reportedBy?.phoneNumber,
                touristEmail: incident.reportedBy?.email,
                touristDigitalId: incident.reportedBy?.digitalIdentityHash,
                type: incident.incidentType,
                severity: incident.severity,
                status: incident.status,
                title: incident.title,
                description: incident.description,
                location: incident.address || 'Location not specified', // Use address string
                coordinates: incident.location?.coordinates || null,
                timestamp: incident.createdAt || incident.incidentDate,
                resolvedAt: incident.resolvedAt,
                assignedOfficer: incident.assignedOfficer,
                evidence: incident.attachments || []
            }
        });
    } catch (error) {
        console.error('Get incident error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ====================UPDATE INCIDENT STATUS ====================
router.patch('/incidents/:id', async (req, res) => {
    try {
        const { status, assignedOfficer, notes } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (assignedOfficer) updateData.assignedOfficer = assignedOfficer;
        if (status === 'resolved') updateData.resolvedAt = new Date();

        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!incident) {
            return res.status(404).json({ success: false, message: 'Incident not found' });
        }

        res.json({
            success: true,
            message: 'Incident updated successfully',
            data: incident
        });
    } catch (error) {
        console.error('Update incident error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==================== GET ACTIVE TOURISTS ====================
router.get('/tourists/active', async (req, res) => {
    try {
        const activeTourists = await Tourist.find({
            lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
            .select('firstName lastName email phoneNumber digitalIdentityHash currentLocation')
            .limit(100);

        res.json({
            success: true,
            data: activeTourists,
            count: activeTourists.length
        });
    } catch (error) {
        console.error('Get active tourists error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
