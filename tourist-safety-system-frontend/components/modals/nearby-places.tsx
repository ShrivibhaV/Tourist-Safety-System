"use client";

import { X, MapPin, Loader2, AlertTriangle, Shield } from "lucide-react";
import { useState, useEffect } from "react";

interface NearbyPlacesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SafePlace {
  name: string;
  type: string;
  distance: number;
  coordinates: number[];
  city: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: string;
  type: string;
  address: string;
}

export function NearbyPlaces({ open, onOpenChange }: NearbyPlacesProps) {
  const [view, setView] = useState<"safe" | "alerts">("safe");
  const [safePlaces, setSafePlaces] = useState<SafePlace[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Get current GPS location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported"));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      console.log("📍 Current location for nearby search:", latitude, longitude);

      // Use OpenStreetMap Overpass API (free, no API key needed)
      const radius = 3000; // 3km radius in meters

      const queries = [
        { tag: 'amenity=police', type: 'Police Station', icon: '🚓' },
        { tag: 'amenity=hospital', type: 'Hospital', icon: '🏥' },
        { tag: 'amenity=pharmacy', type: 'Pharmacy', icon: '💊' },
        { tag: 'tourism=information', type: 'Tourist Center', icon: 'ℹ️' },
        { tag: 'amenity=fire_station', type: 'Fire Station', icon: '🚒' }
      ];

      const allPlaces: SafePlace[] = [];

      // Fetch places using Overpass API
      for (const { tag, type, icon } of queries) {
        try {
          const overpassQuery = `
            [out:json];
            (
              node[${tag}](around:${radius},${latitude},${longitude});
              way[${tag}](around:${radius},${latitude},${longitude});
            );
            out center 10;
          `;

          const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

          const response = await fetch(url, {
            signal: AbortSignal.timeout(8000)
          });

          if (response.ok) {
            const data = await response.json();

            if (data.elements && data.elements.length > 0) {
              for (const element of data.elements) {
                const lat = element.lat || element.center?.lat;
                const lon = element.lon || element.center?.lon;

                if (lat && lon) {
                  const distance = calculateDistance(latitude, longitude, lat, lon);

                  const name = element.tags?.name ||
                    element.tags?.['name:en'] ||
                    element.tags?.operator ||
                    `${type}`;

                  allPlaces.push({
                    name: name,
                    type: type,
                    distance: distance,
                    coordinates: [lon, lat],
                    city: element.tags?.['addr:city'] || element.tags?.['addr:district'] || ""
                  });
                }
              }
            }
          }
        } catch (err) {
          console.log(`Failed to fetch ${type}:`, err);
        }
      }

      // Sort by distance and limit to 20 closest
      allPlaces.sort((a, b) => a.distance - b.distance);
      const limitedPlaces = allPlaces.slice(0, 20);

      setSafePlaces(limitedPlaces);
      console.log(`✅ Found ${limitedPlaces.length} safe places nearby`);

      // Fetch safety alerts from OpenStreetMap (hazards, construction, etc.)
      try {
        const alertQuery = `
          [out:json];
          (
            node["hazard"](around:${radius},${latitude},${longitude});
            way["hazard"](around:${radius},${latitude},${longitude});
            node["highway"="construction"](around:${radius},${latitude},${longitude});
            way["highway"="construction"](around:${radius},${latitude},${longitude});
          );
          out center 10;
        `;

        const alertUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(alertQuery)}`;
        const alertResponse = await fetch(alertUrl, { signal: AbortSignal.timeout(8000) });

        if (alertResponse.ok) {
          const alertData = await alertResponse.json();
          const fetchedAlerts: Alert[] = [];

          if (alertData.elements && alertData.elements.length > 0) {
            for (const element of alertData.elements) {
              const lat = element.lat || element.center?.lat;
              const lon = element.lon || element.center?.lon;

              if (lat && lon) {
                const distance = calculateDistance(latitude, longitude, lat, lon);
                const tags = element.tags || {};

                let title = "Safety Alert";
                let description = "Caution advised in this area";
                let severity = "Medium";
                let type = "General";
                let address = `${(distance / 1000).toFixed(1)} km away`;

                // Try to get street name or area name
                const streetName = tags['addr:street'] || tags['name'] || tags['highway'];
                const areaName = tags['addr:city'] || tags['addr:suburb'] || tags['addr:district'];

                if (streetName && areaName) {
                  address = `${streetName}, ${areaName}`;
                } else if (streetName) {
                  address = `${streetName} (${(distance / 1000).toFixed(1)} km away)`;
                } else if (areaName) {
                  address = `${areaName} (${(distance / 1000).toFixed(1)} km away)`;
                }

                if (tags.hazard) {
                  title = `⚠️ Hazard: ${tags.hazard}`;
                  description = tags.description || `${tags.hazard} reported in this area. Exercise caution.`;
                  severity = "High";
                  type = "Hazard";
                } else if (tags.highway === "construction") {
                  title = `🚧 Road Work`;
                  description = `Construction in progress. Expect traffic delays and follow detour signs.`;
                  severity = "Medium";
                  type = "Construction";
                }

                // Only add if we have useful location info
                if (streetName || areaName || distance < 1000) {
                  fetchedAlerts.push({
                    id: element.id.toString(),
                    title: title,
                    description: description,
                    severity: severity,
                    type: type,
                    address: address
                  });
                }
              }
            }
          }

          // Limit to 3 most relevant alerts
          const limitedAlerts = fetchedAlerts.slice(0, 3);

          // Add useful tourist safety tips if we have less than 3 alerts
          const safetyTips = [
            {
              id: "tip-1",
              title: "💡 Stay Connected",
              description: "Keep your phone charged and share your location with trusted contacts. Save emergency numbers (Police: 100, Ambulance: 102).",
              severity: "Low",
              type: "Safety Tip",
              address: "General Advisory"
            },
            {
              id: "tip-2",
              title: "💡 Secure Your Belongings",
              description: "Keep valuables in hotel safe. Avoid displaying expensive items in crowded areas. Use anti-theft bags.",
              severity: "Low",
              type: "Safety Tip",
              address: "General Advisory"
            },
            {
              id: "tip-3",
              title: "💡 Transportation Safety",
              description: "Use registered taxis or ride-sharing apps (Uber/Ola). Avoid unmarked vehicles. Share trip details with contacts.",
              severity: "Low",
              type: "Safety Tip",
              address: "General Advisory"
            },
            {
              id: "tip-4",
              title: "💡 Food & Water Safety",
              description: "Drink bottled water. Eat at reputable restaurants. Avoid street food if you have a sensitive stomach.",
              severity: "Low",
              type: "Safety Tip",
              address: "General Advisory"
            },
            {
              id: "tip-5",
              title: "💡 Cultural Awareness",
              description: "Dress modestly when visiting religious sites. Ask permission before photographing people. Respect local customs.",
              severity: "Low",
              type: "Safety Tip",
              address: "General Advisory"
            }
          ];

          // Add safety tips to fill up to 5 total alerts
          while (limitedAlerts.length < 5 && safetyTips.length > 0) {
            const randomIndex = Math.floor(Math.random() * safetyTips.length);
            limitedAlerts.push(safetyTips[randomIndex]);
            safetyTips.splice(randomIndex, 1);
          }

          setAlerts(limitedAlerts);
          console.log(`⚠️ Found ${limitedAlerts.length} safety alerts and tips`);
        }
      } catch (err) {
        console.log("Failed to fetch alerts:", err);
        // Set default safety tips
        setAlerts([
          {
            id: "tip-1",
            title: "💡 Emergency Contacts",
            description: "Police: 100 | Ambulance: 102 | Fire: 101 | Tourist Helpline: 1363. Save these numbers in your phone.",
            severity: "Low",
            type: "Safety Tip",
            address: "General Advisory"
          },
          {
            id: "tip-2",
            title: "💡 Stay Vigilant",
            description: "Keep your belongings secure in crowded areas. Be aware of your surroundings, especially at night.",
            severity: "Low",
            type: "Safety Tip",
            address: "General Advisory"
          }
        ]);
      }

      setLoading(false);
    } catch (e: any) {
      console.error("Fetch error:", e);
      if (e.code === 1) {
        setError("Location access denied. Please enable location permission.");
      } else if (e.code === 2) {
        setError("Location unavailable. Please check GPS settings.");
      } else if (e.code === 3) {
        setError("Location request timed out. Please try again.");
      } else {
        setError("Failed to get location. Please enable GPS and try again.");
      }
      setLoading(false);
    }
  };

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      "Police Station": "🚓",
      "Hospital": "🏥",
      "Tourist Center": "ℹ️",
    };
    return iconMap[type] || "📍";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "bg-red-100 border-red-300 text-red-800";
      case "High": return "bg-orange-100 border-orange-300 text-orange-800";
      case "Medium": return "bg-yellow-100 border-yellow-300 text-yellow-800";
      default: return "bg-blue-100 border-blue-300 text-blue-800";
    }
  };

  const openMaps = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      window.open(`https://maps.google.com/?q=${latitude},${longitude}`, "_blank");
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[600px] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex items-center justify-between p-5">
            <h2 className="text-xl font-bold text-gray-900">Nearby Information</h2>
            <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setView("safe")}
              className={`flex-1 px-4 py-3 font-medium flex items-center justify-center gap-2 ${view === "safe"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Shield className="w-4 h-4" />
              Safe Places ({safePlaces.length})
            </button>
            <button
              onClick={() => setView("alerts")}
              className={`flex-1 px-4 py-3 font-medium flex items-center justify-center gap-2 ${view === "alerts"
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Safety Alerts ({alerts.length})
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-10 text-gray-600">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              Loading...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center text-red-500 space-y-3 py-6">
              <p>{error}</p>
              <button
                onClick={fetchData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Safe Places View */}
          {!loading && !error && view === "safe" && (
            <>
              {safePlaces.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-3">No safe places found nearby.</p>
                  <p className="text-xs text-gray-400">
                    <strong>Note:</strong> Safe places are currently available for Delhi, Bangalore, Manali, and Goa only.
                    Your detected location might be outside these cities.
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    (On mobile with GPS, this will show accurate results)
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {safePlaces.map((place, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          // Open Google Maps with directions from current location to this place
                          navigator.geolocation.getCurrentPosition((pos) => {
                            const { latitude: myLat, longitude: myLon } = pos.coords;
                            const [destLon, destLat] = place.coordinates;
                            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${myLat},${myLon}&destination=${destLat},${destLon}&travelmode=driving`;
                            window.open(mapsUrl, '_blank');
                          });
                        }}
                        className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-200 transition cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span className="text-3xl">{getTypeIcon(place.type)}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{place.name}</p>
                          <p className="text-sm text-gray-600">{place.type}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {(place.distance / 1000).toFixed(1)} km away • Click for directions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Alerts View */}
          {!loading && !error && view === "alerts" && (
            <>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-16 h-16 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-green-700">All Clear!</p>
                  <p className="text-gray-600 mt-1">No safety alerts in your area</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border-2 rounded-lg ${getSeverityColor(alert.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{alert.title}</h3>
                        <span className="px-2 py-1 bg-white rounded text-xs font-semibold">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.address}
                        </span>
                        <span className="px-2 py-1 bg-white rounded">
                          {alert.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Maps Button */}
          {!loading && !error && (
            <button
              onClick={openMaps}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
