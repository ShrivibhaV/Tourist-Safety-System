// routes/dashboardRoutes.js
import express from 'express';
import TouristRegistration from '../models/tourist_register.model.js';
import TouristDashboard from '../models/tourist_dashboard.model.js';
import Incident from '../models/incident.model.js';
import SOS from '../models/sos.model.js';
import Alert from '../models/alert.model.js';

const router = express.Router();

// ==================== REGISTER ====================
router.post('/tourists/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      nationality,
      idType,
      idNumber,
      photo,
      emergencyContactName,
      emergencyContactPhone,
      preferredLanguage,
      digitalIdentityHash,
      touristId
    } = req.body;

    console.log('Registration attempt for:', email);

    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingTourist = await TouristRegistration.findOne({ $or: [{ email }, { phone }] });
    if (existingTourist) {
      return res.status(409).json({ success: false, message: 'Tourist with this email or phone already exists' });
    }

    const tourist = await TouristRegistration.create({
      firstName,
      lastName,
      email,
      phone,
      nationality: nationality || 'Not Specified',
      idType: idType || 'Passport',
      idNumber: idNumber || 'TEMP' + Date.now(),
      photo: photo || '',
      emergencyContactName: emergencyContactName || 'Emergency Contact',
      emergencyContactPhone: emergencyContactPhone || phone,
      preferredLanguage: preferredLanguage || 'English',
      digitalIdentityHash: digitalIdentityHash || '',
      touristId: touristId || '',
      isActive: true,
      isVerified: false
    });

    console.log('Tourist created:', tourist._id);

    await TouristDashboard.create({
      tourist: tourist._id,
      currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] },
      emergencyContacts: [{
        name: emergencyContactName || 'Emergency Contact',
        phone: emergencyContactPhone || phone,
        relationship: 'Primary Contact'
      }],
      safetyScore: 100
    });

    console.log('Dashboard created for tourist');

    const digitalId = `TST-${new Date().getFullYear()}-${tourist._id.toString().slice(-8).toUpperCase()}`;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        id: tourist._id,
        digitalId,
        name: `${tourist.firstName} ${tourist.lastName}`,
        email: tourist.email,
        safetyScore: 100
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate entry: Email or phone already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
});

// ==================== LOGIN ====================
router.post('/tourists/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    const tourist = await TouristRegistration.findOne({ email });
    if (!tourist) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    console.log('Tourist found:', tourist._id);

    if (tourist.password && typeof tourist.comparePassword === 'function') {
      const isMatch = await tourist.comparePassword(password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    } else {
      if (tourist.password !== password) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if ('lastLogin' in tourist) {
      tourist.lastLogin = new Date();
      await tourist.save();
    }

    const fullName = tourist.fullName || `${tourist.firstName} ${tourist.lastName}`;
    res.json({ success: true, message: 'Login successful', data: { id: tourist._id, name: fullName, email: tourist.email } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET DASHBOARD DATA ====================
router.get('/dashboard/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;
    console.log('Fetching dashboard for tourist:', touristId);

    const tourist = await TouristRegistration.findById(touristId);
    if (!tourist) return res.status(404).json({ success: false, message: 'Tourist not found' });

    let dashboard = await TouristDashboard.findOne({ tourist: touristId })
      .populate('nearbyAlerts')
      .populate('incidentReports')
      .populate('reportedSOS');

    if (!dashboard) {
      dashboard = await TouristDashboard.create({
        tourist: touristId,
        currentLocation: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Default: Bangalore
        emergencyContacts: [{
          name: tourist.emergencyContactName || 'Emergency Contact',
          phone: tourist.emergencyContactPhone || '911',
          relationship: 'Primary'
        }],
        safetyScore: 100
      });
    }

    // Get current location coordinates
    const [longitude, latitude] = dashboard.currentLocation.coordinates;

    // Fetch nearby alerts within 10km radius
    const nearbyAlerts = await Alert.findNearLocation(longitude, latitude, 10000);

    // Calculate safety score based on nearby alerts
    let safetyScore = 100;
    if (nearbyAlerts.length > 0) {
      nearbyAlerts.forEach(alert => {
        if (alert.severity === 'Critical') safetyScore -= 15;
        else if (alert.severity === 'High') safetyScore -= 10;
        else if (alert.severity === 'Medium') safetyScore -= 5;
        else safetyScore -= 2;
      });
      safetyScore = Math.max(0, Math.min(100, safetyScore)); // Keep between 0-100
    }

    // Update safety score in dashboard
    dashboard.safetyScore = safetyScore;
    dashboard.nearbyAlerts = nearbyAlerts.map(a => a._id);
    await dashboard.save();

    // Get incident count
    const incidentCount = await Incident.countDocuments({ reportedBy: touristId });

    // Get actual city name from coordinates using reverse geocoding (OpenStreetMap Nominatim - free, no API key needed)
    const getCityFromCoordinates = async (lat, lng) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          {
            headers: {
              'User-Agent': 'TouristSafetySystem/1.0' // Required by Nominatim
            }
          }
        );
        const data = await response.json();

        // Extract city name from response (try different fields)
        const city = data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.state ||
          data.address?.country ||
          'Unknown Location';

        const country = data.address?.country || 'India';

        return { city, country };
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to approximate matching if API fails
        if (Math.abs(lat - 28.6139) < 1 && Math.abs(lng - 77.2090) < 1) return { city: "New Delhi", country: "India" };
        if (Math.abs(lat - 12.9716) < 1 && Math.abs(lng - 77.5946) < 1) return { city: "Bangalore", country: "India" };
        if (Math.abs(lat - 19.0760) < 1 && Math.abs(lng - 72.8777) < 1) return { city: "Mumbai", country: "India" };
        if (Math.abs(lat - 32.2396) < 2 && Math.abs(lng - 77.1892) < 2) return { city: "Manali", country: "India" };
        if (Math.abs(lat - 15.2993) < 1 && Math.abs(lng - 74.1240) < 1) return { city: "Goa", country: "India" };
        return { city: "India", country: "India" };
      }
    };

    const locationInfo = await getCityFromCoordinates(latitude, longitude);

    const dashboardData = {
      currentLocation: {
        city: locationInfo.city,
        country: locationInfo.country,
        coordinates: [longitude, latitude]
      },
      safetyScore: safetyScore,
      safetyLevel: safetyScore >= 80 ? "Excellent safety level" :
        safetyScore >= 60 ? "Good safety level" :
          safetyScore >= 40 ? "Moderate safety level" : "Low safety level",
      nearbyAlerts: nearbyAlerts.length,
      myReports: incidentCount,
      emergencyContacts: dashboard.emergencyContacts || [],
      activeSOSCount: dashboard.reportedSOS?.filter(sos => sos.status === 'Active' || sos.status === 'Responded').length || 0
    };

    res.json({ success: true, data: dashboardData });

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET PROFILE DATA ====================
router.get('/profile/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;
    const tourist = await TouristRegistration.findById(touristId);
    if (!tourist) return res.status(404).json({ success: false, message: 'Tourist not found' });

    const profileData = {
      firstName: tourist.firstName,
      lastName: tourist.lastName,
      email: tourist.email,
      phone: tourist.phone,
      nationality: tourist.nationality,
      idType: tourist.idType,
      idNumber: tourist.idNumber,
      passportNumber: tourist.idNumber, // For backward compatibility
      emergencyContactName: tourist.emergencyContactName,
      emergencyContactPhone: tourist.emergencyContactPhone,
      preferredLanguage: tourist.preferredLanguage || "English",
      photo: tourist.photo || null,
      digitalIdentityHash: tourist.digitalIdentityHash || null,
      touristId: tourist.touristId || null,
      isVerified: tourist.isVerified || false,
      createdAt: tourist.createdAt,
      lastLogin: tourist.lastLogin
    };

    res.json({ success: true, data: profileData });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== UPDATE PROFILE ====================
router.patch('/profile/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;
    const updates = req.body;

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'preferredLanguage', 'photo', 'emergencyContactName', 'emergencyContactPhone'];
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) filteredUpdates[key] = updates[key];
    });

    const tourist = await TouristRegistration.findByIdAndUpdate(touristId, filteredUpdates, { new: true, runValidators: true });
    if (!tourist) return res.status(404).json({ success: false, message: 'Tourist not found' });

    res.json({ success: true, message: 'Profile updated successfully', data: tourist });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== CREATE SOS ====================
router.post('/sos', async (req, res) => {
  try {
    const sos = await SOS.create(req.body);

    await TouristDashboard.findOneAndUpdate({ tourist: req.body.tourist }, { $push: { reportedSOS: sos._id } });

    res.status(201).json({ success: true, message: 'SOS alert created successfully', data: sos });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== REPORT INCIDENT ====================
router.post('/incidents', async (req, res) => {
  try {
    const incident = await Incident.create(req.body);

    await TouristDashboard.findOneAndUpdate({ tourist: req.body.reportedBy }, { $push: { incidentReports: incident._id } });

    res.status(201).json({ success: true, message: 'Incident reported successfully', data: incident });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ==================== GET MY INCIDENTS ====================
router.get('/incidents/my/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;

    const incidents = await Incident.find({ reportedBy: touristId }).sort({ incidentDate: -1 });

    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADD/DELETE EMERGENCY CONTACTS (from Code B) ====================
router.post('/dashboard/contacts/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;
    const newContact = req.body;

    const dashboard = await TouristDashboard.findOne({ tourist: touristId });
    if (!dashboard) return res.status(404).json({ success: false, message: 'Dashboard not found' });

    dashboard.emergencyContacts.push(newContact);
    await dashboard.save();

    res.json({ success: true, message: 'Contact added successfully', data: dashboard.emergencyContacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/dashboard/contacts/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;
    const { index } = req.body;

    const dashboard = await TouristDashboard.findOne({ tourist: touristId });
    if (!dashboard) return res.status(404).json({ success: false, message: 'Dashboard not found' });

    dashboard.emergencyContacts.splice(index, 1);
    await dashboard.save();

    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== UPDATE LOCATION ====================
router.patch('/dashboard/location/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const dashboard = await TouristDashboard.findOne({ tourist: touristId });
    if (!dashboard) return res.status(404).json({ success: false, message: 'Dashboard not found' });

    // Update location
    dashboard.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };

    // Fetch nearby alerts
    const nearbyAlerts = await Alert.findNearLocation(longitude, latitude, 10000);

    // Update safety score
    let safetyScore = 100;
    nearbyAlerts.forEach(alert => {
      if (alert.severity === 'Critical') safetyScore -= 15;
      else if (alert.severity === 'High') safetyScore -= 10;
      else if (alert.severity === 'Medium') safetyScore -= 5;
      else safetyScore -= 2;
    });
    safetyScore = Math.max(0, Math.min(100, safetyScore));

    dashboard.safetyScore = safetyScore;
    dashboard.nearbyAlerts = nearbyAlerts.map(a => a._id);
    await dashboard.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: { latitude, longitude },
        safetyScore,
        nearbyAlertsCount: nearbyAlerts.length
      }
    });

  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET NEARBY ALERTS (DETAILED) ====================
router.get('/alerts/nearby/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;
    const { radius = 10000 } = req.query; // Default 10km

    const dashboard = await TouristDashboard.findOne({ tourist: touristId });
    if (!dashboard) return res.status(404).json({ success: false, message: 'Dashboard not found' });

    const [longitude, latitude] = dashboard.currentLocation.coordinates;

    // Fetch nearby alerts
    const alerts = await Alert.findNearLocation(longitude, latitude, parseInt(radius));

    res.json({
      success: true,
      count: alerts.length,
      data: alerts.map(alert => ({
        id: alert._id,
        title: alert.title,
        description: alert.description,
        type: alert.alertType,
        severity: alert.severity,
        address: alert.address,
        radius: alert.radius,
        issuedBy: alert.issuedBy,
        createdAt: alert.createdAt
      }))
    });

  } catch (error) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== GET NEARBY SAFE PLACES ====================
router.get('/safe-places/:touristId', async (req, res) => {
  try {
    const { touristId } = req.params;

    const dashboard = await TouristDashboard.findOne({ tourist: touristId });
    if (!dashboard) return res.status(404).json({ success: false, message: 'Dashboard not found' });

    const [longitude, latitude] = dashboard.currentLocation.coordinates;

    // Hard-coded safe places for major cities (you could move this to database)
    const allSafePlaces = [
      // Delhi
      { name: "India Gate Police Station", type: "Police Station", coordinates: [77.2295, 28.6123], city: "Delhi" },
      { name: "AIIMS Hospital", type: "Hospital", coordinates: [77.2074, 28.5678], city: "Delhi" },
      { name: "Delhi Tourism Office", type: "Tourist Center", coordinates: [77.2167, 28.6357], city: "Delhi" },

      // Bangalore
      { name: "Koramangala Police Station", type: "Police Station", coordinates: [77.6270, 12.9352], city: "Bangalore" },
      { name: "Manipal Hospital", type: "Hospital", coordinates: [77.5946, 12.9698], city: "Bangalore" },
      { name: "Karnataka Tourism Office", type: "Tourist Center", coordinates: [77.5983, 12.9767], city: "Bangalore" },

      // Manali
      { name: "Manali Police Station", type: "Police Station", coordinates: [77.1891, 32.2396], city: "Manali" },
      { name: "Mission Hospital", type: "Hospital", coordinates: [77.1825, 32.2404], city: "Manali" },

      // Goa
      { name: "Calangute Police Outpost", type: "Police Station", coordinates: [73.7551, 15.5440], city: "Goa" },
      { name: "Goa Medical College", type: "Hospital", coordinates: [73.8278, 15.4851], city: "Goa" }
    ];

    // Calculate distance and filter nearby places (within 20km)
    const nearbySafePlaces = allSafePlaces.filter(place => {
      const distance = calculateDistance(latitude, longitude, place.coordinates[1], place.coordinates[0]);
      return distance <= 20000; // 20km
    }).map(place => ({
      ...place,
      distance: Math.round(calculateDistance(latitude, longitude, place.coordinates[1], place.coordinates[0]))
    })).sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      count: nearbySafePlaces.length,
      data: nearbySafePlaces
    });

  } catch (error) {
    console.error('Fetch safe places error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to calculate distance using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export default router;
