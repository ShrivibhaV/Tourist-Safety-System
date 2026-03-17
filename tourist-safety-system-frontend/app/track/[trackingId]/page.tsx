"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Clock, Activity, Navigation, AlertCircle } from "lucide-react";

interface LocationData {
    touristName: string;
    emergencyContact: string;
    isActive: boolean;
    isExpired: boolean;
    currentLocation: {
        latitude: number;
        longitude: number;
        address: string;
        lastUpdate: string;
    };
    locationHistory: Array<{
        latitude: number;
        longitude: number;
        timestamp: string;
        accuracy: number;
        speed: number | null;
        address: string;
    }>;
    sessionInfo: {
        startTime: string;
        expiresAt: string;
        minutesRemaining: number;
        updateInterval: number;
    };
}

export default function TrackingPage() {
    const params = useParams();
    const trackingId = params.trackingId as string;

    const [data, setData] = useState<LocationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (trackingId) {
            fetchTrackingData();
            // Auto-refresh every 30 seconds
            const interval = setInterval(fetchTrackingData, 30000);
            return () => clearInterval(interval);
        }
    }, [trackingId]);

    const fetchTrackingData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/tracking/view/${trackingId}`);
            const result = await response.json();

            if (result.success) {
                setData(result.data);
                setError("");
            } else {
                setError(result.message);
            }
            setLoading(false);
        } catch (err: any) {
            console.error("Fetch error:", err);
            setError("Failed to load tracking data");
            setLoading(false);
        }
    };

    const getDirections = () => {
        if (!data) return;
        const { latitude, longitude } = data.currentLocation;
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, "_blank");
    };

    const formatTimeRemaining = (minutes: number): string => {
        if (minutes < 60) return `${minutes} minutes`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    };

    const getTimeSinceUpdate = (lastUpdate: string): string => {
        const now = new Date();
        const updateTime = new Date(lastUpdate);
        const diffMs = now.getTime() - updateTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        const hours = Math.floor(diffMins / 60);
        return `${hours}h ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-700 font-medium">Loading tracking data...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tracking Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || "This tracking session may have expired or been stopped."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const statusColor = data.isActive && !data.isExpired ? "green" : "gray";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                📍 Tracking: {data.touristName}
                            </h1>
                            <p className="text-gray-600">Shared with {data.emergencyContact}</p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusColor === "green" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                }`}>
                                <span className={`h-2 w-2 rounded-full ${statusColor === "green" ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></span>
                                {data.isActive && !data.isExpired ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>

                    {/* Current Location */}
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <MapPin className="w-6 h-6 text-blue-600" />
                            <div className="flex-1">
                                <p className="font-semibold text-gray-900">{data.currentLocation.address || "Location updating..."}</p>
                                <p className="text-sm text-gray-600">
                                    {data.currentLocation.latitude.toFixed(6)}, {data.currentLocation.longitude.toFixed(6)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Activity className="w-4 h-4" />
                            <span>Last updated: {getTimeSinceUpdate(data.currentLocation.lastUpdate)}</span>
                        </div>
                    </div>
                </div>

                {/* Map Placeholder */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="relative">
                        {/* Simple map iframe using Google Maps */}
                        <iframe
                            src={`https://maps.google.com/maps?q=${data.currentLocation.latitude},${data.currentLocation.longitude}&z=15&output=embed`}
                            width="100%"
                            height="400"
                            style={{ border: 0 }}
                            loading="lazy"
                            className="w-full"
                        ></iframe>

                        {/* Time remaining overlay */}
                        {data.isActive && !data.isExpired && (
                            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-orange-600" />
                                    <span className="font-semibold text-gray-900">
                                        {formatTimeRemaining(data.sessionInfo.minutesRemaining)} left
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={getDirections}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105 shadow-lg"
                    >
                        <Navigation className="w-5 h-5" />
                        Get Directions
                    </button>
                    <button
                        onClick={fetchTrackingData}
                        className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105 shadow-lg"
                    >
                        <Activity className="w-5 h-5" />
                        Refresh Now
                    </button>
                </div>

                {/* Location History */}
                {data.locationHistory.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Movement History</h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {data.locationHistory.slice(0, 10).map((loc, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                    <div className="bg-blue-100 p-2 rounded-full shrink-0">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{loc.address || "Unknown location"}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(loc.timestamp).toLocaleString()}
                                            {loc.accuracy && ` • Accuracy: ${Math.round(loc.accuracy)}m`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Session Info */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Session Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Started</p>
                            <p className="font-medium text-gray-900">{new Date(data.sessionInfo.startTime).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Expires</p>
                            <p className="font-medium text-gray-900">{new Date(data.sessionInfo.expiresAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Update Interval</p>
                            <p className="font-medium text-gray-900">Every {data.sessionInfo.updateInterval} minutes</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Status</p>
                            <p className={`font-medium ${statusColor === "green" ? "text-green-600" : "text-gray-600"}`}>
                                {data.isActive && !data.isExpired ? "Tracking Active" : data.isExpired ? "Expired" : "Stopped"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-600">
                    <p>🛡️ Tourist Safety System - Live Location Tracking</p>
                    <p className="mt-1">This page auto-refreshes every 30 seconds</p>
                </div>
            </div>
        </div>
    );
}
