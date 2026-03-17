// components/stats-cards.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapPin, Shield, AlertTriangle, FileText } from 'lucide-react';

interface DashboardStats {
  currentLocation: {
    city: string;
    country: string;
  };
  safetyScore: number;
  safetyLevel: string;
  nearbyAlerts: number;
  myReports: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const touristId = localStorage.getItem('touristId');

      if (!touristId) {
        // Show default/placeholder data if not logged in
        setStats({
          currentLocation: { city: 'Loading...', country: 'India' },
          safetyScore: 85,
          safetyLevel: 'Excellent safety level',
          nearbyAlerts: 2,
          myReports: 0
        });
        setLoading(false);
        return;
      }

      // STEP 1: Get user's CURRENT GPS location
      let currentCity = 'Loading...';
      let currentCountry = 'India';

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0 // Force fresh location, do not use cache
          });
        });

        const { latitude, longitude } = position.coords;

        console.log('📍 Dashboard: Got GPS location:', latitude, longitude);

        // Fetch nearby alerts count from OpenStreetMap
        let alertsCount = 0;
        try {
          const radius = 3000; // 3km radius
          const alertQuery = `
            [out:json];
            (
              node["hazard"](around:${radius},${latitude},${longitude});
              way["hazard"](around:${radius},${latitude},${longitude});
              node["highway"="construction"](around:${radius},${latitude},${longitude});
              way["highway"="construction"](around:${radius},${latitude},${longitude});
            );
            out count;
          `;

          const alertUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(alertQuery)}`;
          const alertResponse = await fetch(alertUrl, { signal: AbortSignal.timeout(5000) });

          if (alertResponse.ok) {
            const alertData = await alertResponse.json();
            if (alertData.elements) {
              alertsCount = alertData.elements.length;
              console.log(`⚠️ Found ${alertsCount} nearby alerts`);
            }
          }
        } catch (alertError) {
          console.log('Failed to fetch alerts count:', alertError);
        }

        // STEP 2: Do client-side reverse geocoding for accurate city name
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
            {
              headers: {
                'User-Agent': 'SafeTour-Tourist-Safety-App'
              }
            }
          );

          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json();
            const address = geocodeData.address;

            // Extract city name (try multiple fields)
            currentCity = address.city ||
              address.town ||
              address.village ||
              address.county ||
              address.state_district ||
              'Unknown Location';

            currentCountry = address.country || 'India';

            console.log('📍 Reverse geocoded to:', currentCity, currentCountry);
          }
        } catch (geocodeError) {
          console.warn('Reverse geocoding failed, using coordinates:', geocodeError);
          currentCity = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }

        // STEP 3: Update backend with current GPS coordinates (optional, non-blocking)
        try {
          await fetch(`http://localhost:5000/api/dashboard/location/${touristId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude }),
            signal: AbortSignal.timeout(3000)
          });
        } catch (backendError) {
          console.log('Backend location update failed (non-critical)');
        }

        // STEP 4: Fetch other dashboard data from backend
        try {
          const response = await fetch(`http://localhost:5000/api/dashboard/${touristId}`, {
            signal: AbortSignal.timeout(3000)
          });

          if (response.ok) {
            const result = await response.json();

            if (result.success && result.data) {
              setStats({
                currentLocation: { city: currentCity, country: currentCountry }, // Use client-side location
                safetyScore: result.data.safetyScore || 85,
                safetyLevel: result.data.safetyLevel || 'Excellent safety level',
                nearbyAlerts: alertsCount, // Use real-time alerts count from OSM
                myReports: result.data.myReports || 0
              });
              setLoading(false);
              return;
            }
          }
        } catch (backendError) {
          console.log('Backend unavailable, using local data');
        }

        // Fallback: Use client-side location with real alerts count
        setStats({
          currentLocation: { city: currentCity, country: currentCountry },
          safetyScore: 85,
          safetyLevel: 'Excellent safety level',
          nearbyAlerts: alertsCount, // Use real-time alerts count
          myReports: 0
        });
        setLoading(false);
        return;

      } catch (gpsError) {
        console.warn('GPS unavailable:', gpsError);
        currentCity = 'Location unavailable';
        // Continue with placeholder
      }

      // STEP 4: Fetch other dashboard data from backend
      try {
        const response = await fetch(`http://localhost:5000/api/dashboard/${touristId}`, {
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          const result = await response.json();

          if (result.success && result.data) {
            setStats({
              currentLocation: { city: currentCity, country: currentCountry }, // Use client-side location
              safetyScore: result.data.safetyScore || 85,
              safetyLevel: result.data.safetyLevel || 'Excellent safety level',
              nearbyAlerts: result.data.nearbyAlerts || 0,
              myReports: result.data.myReports || 0
            });
            return;
          }
        }
      } catch (backendError) {
        console.log('Backend unavailable, using local data');
      }

      // Fallback: Use client-side location with default stats
      setStats({
        currentLocation: { city: currentCity, country: currentCountry },
        safetyScore: 85,
        safetyLevel: 'Excellent safety level',
        nearbyAlerts: 0,
        myReports: 0
      });

    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Show error state
      setStats({
        currentLocation: { city: 'Location unavailable', country: 'India' },
        safetyScore: 85,
        safetyLevel: 'Excellent safety level',
        nearbyAlerts: 0,
        myReports: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Listen for custom events to refresh stats
    const handleRefresh = () => {
      console.log('Refreshing dashboard stats...');
      fetchStats();
    };

    window.addEventListener('refreshDashboard', handleRefresh);

    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Current Location Card */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">Current Location</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {stats.currentLocation.city}, {stats.currentLocation.country}
        </h3>
      </div>

      {/* Safety Score Card */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">Safety Score</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{stats.safetyScore}</h3>
        <p className="text-sm text-gray-600 mt-1">{stats.safetyLevel}</p>
      </div>

      {/* Nearby Alerts Card */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-gray-600">Nearby Alerts</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{stats.nearbyAlerts}</h3>
        <p className="text-sm text-gray-600 mt-1">Active in your area</p>
      </div>

      {/* My Reports Card */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-gray-600">My Reports</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{stats.myReports}</h3>
        <p className="text-sm text-gray-600 mt-1">Total incidents reported</p>
      </div>
    </div>
  );
}