"use client";

import { useEffect, useState } from "react";
import { MapPin, Users, AlertCircle, RefreshCw } from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface TouristLocation {
    touristId: string;
    touristName: string;
    latitude: number;
    longitude: number;
    lastUpdate: string;
    status: "safe" | "tracking" | "alert";
    trackingDuration?: number;
}

export function LiveTrackingMap() {
    const [tourists, setTourists] = useState<TouristLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "safe" | "tracking" | "alert">("all");

    const fetchTouristLocations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/security/live-locations`);
            const result = await response.json();

            if (result.success && result.data) {
                setTourists(result.data);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch tourist locations:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTouristLocations();
        // Auto-refresh every 15 seconds
        const interval = setInterval(fetchTouristLocations, 15000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "safe":
                return "bg-green-500";
            case "tracking":
                return "bg-blue-500";
            case "alert":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "safe":
                return "Safe";
            case "tracking":
                return "Active Tracking";
            case "alert":
                return "Alert";
            default:
                return "Unknown";
        }
    };

    const filteredTourists = filter === "all"
        ? tourists
        : tourists.filter(t => t.status === filter);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Live Tourist Locations
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Auto-updates every 15s
                    </span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${filter === "all"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    All ({tourists.length})
                </button>
                <button
                    onClick={() => setFilter("safe")}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${filter === "safe"
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Safe ({tourists.filter(t => t.status === "safe").length})
                </button>
                <button
                    onClick={() => setFilter("tracking")}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${filter === "tracking"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Tracking ({tourists.filter(t => t.status === "tracking").length})
                </button>
                <button
                    onClick={() => setFilter("alert")}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${filter === "alert"
                            ? "bg-red-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Alerts ({tourists.filter(t => t.status === "alert").length})
                </button>
            </div>

            {/* Map Placeholder - In a real implementation, this would be an interactive map */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-blue-200 p-8 mb-4">
                <div className="text-center">
                    <MapPin className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">Interactive Map View</p>
                    <p className="text-sm text-gray-600">
                        {filteredTourists.length} tourist{filteredTourists.length !== 1 ? "s" : ""} currently visible
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        In production: Google Maps or Leaflet integration showing real-time markers
                    </p>
                </div>
            </div>

            {/* Tourist List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20"></div>
                    ))}
                </div>
            ) : filteredTourists.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No tourists currently being tracked</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredTourists.map((tourist) => (
                        <div
                            key={tourist.touristId}
                            className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="relative">
                                        <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                                        {tourist.status === "tracking" && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-gray-900">{tourist.touristName}</h4>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                                                    tourist.status
                                                )}`}
                                            >
                                                {getStatusText(tourist.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">ID: {tourist.touristId}</p>
                                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                            <div>
                                                <span className="font-medium">Lat:</span> {tourist.latitude.toFixed(6)}
                                            </div>
                                            <div>
                                                <span className="font-medium">Lng:</span> {tourist.longitude.toFixed(6)}
                                            </div>
                                            <div className="col-span-2">
                                                <span className="font-medium">Last Update:</span>{" "}
                                                {new Date(tourist.lastUpdate).toLocaleTimeString()}
                                            </div>
                                            {tourist.trackingDuration && (
                                                <div className="col-span-2">
                                                    <span className="font-medium">Tracking Duration:</span>{" "}
                                                    {tourist.trackingDuration} minutes
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {tourist.status === "alert" && (
                                    <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
