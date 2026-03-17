"use client";

import { MapPin, StopCircle, Share2, Clock, Activity } from "lucide-react";
import { useState, useEffect } from "react";

interface TrackingInfo {
    trackingId: string;
    trackingUrl: string;
    emergencyContact: {
        name: string;
        phone: string;
    };
    startTime: string;
    expiresAt: string;
    minutesRemaining: number;
    lastUpdate: string;
}

export function TrackingControls() {
    const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkActiveTracking();
        // Check every minute for updates
        const interval = setInterval(checkActiveTracking, 60000);

        // Listen for tracking start event to update immediately
        const handleTrackingStart = () => checkActiveTracking();
        window.addEventListener('tracking-started', handleTrackingStart);

        return () => {
            clearInterval(interval);
            window.removeEventListener('tracking-started', handleTrackingStart);
        };
    }, []);

    const checkActiveTracking = async () => {
        const touristId = localStorage.getItem("touristId");
        if (!touristId) return;

        try {
            const response = await fetch(`http://localhost:5000/api/tracking/active/${touristId}`);
            const result = await response.json();

            if (result.success && result.hasActiveTracking) {
                setTrackingInfo(result.data);
            } else {
                setTrackingInfo(null);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to check tracking status:", error);
            setLoading(false);
        }
    };

    const handleStopTracking = async () => {
        if (!trackingInfo) return;

        const confirm = window.confirm(
            "Are you sure you want to stop sharing your location?"
        );
        if (!confirm) return;

        try {
            const touristId = localStorage.getItem("touristId");
            const response = await fetch(`http://localhost:5000/api/tracking/stop/${trackingInfo.trackingId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ touristId })
            });

            const result = await response.json();

            if (result.success) {
                setTrackingInfo(null);
                // Stop GPS tracking
                if (typeof window !== 'undefined') {
                    const { gpsTracker } = await import('../services/gps-tracker');
                    gpsTracker.stopTracking();
                }
                // Reload page to show share button again
                window.location.reload();
            } else {
                alert("Failed to stop tracking: " + result.message);
            }
        } catch (error) {
            console.error("Error stopping tracking:", error);
            alert("Failed to stop tracking. Please try again.");
        }
    };

    const handleShareLink = () => {
        if (!trackingInfo) return;

        // Extract tracking ID from URL
        const trackingId = trackingInfo.trackingUrl.split('/').pop() || '';

        // Check if it's a localhost URL
        const isLocalhost = trackingInfo.trackingUrl.includes('localhost');

        let message = '';

        if (isLocalhost) {
            // For localhost, provide tracking ID and instructions
            message = `🛡️ *Tourist Safety System*\n\nI'm sharing my live location with you!\n\n🔑 *Tracking ID:* ${trackingId}\n\n📱 *How to track me:*\n1. Open: http://localhost:3000/track/${trackingId}\n2. Or visit the Tourist Safety System and enter tracking ID: ${trackingId}\n\n⏰ *Expires:* ${new Date(trackingInfo.expiresAt).toLocaleString()}\n\n_Note: You need to be on the same network or use the deployed website URL_`;
        } else {
            // For production URLs, send the direct link
            message = `🛡️ *Tourist Safety System*\n\nI'm sharing my live location with you!\n\n📍 *Track me here:*\n${trackingInfo.trackingUrl}\n\n🔑 *Tracking ID:* ${trackingId}\n\n⏰ *Expires:* ${new Date(trackingInfo.expiresAt).toLocaleString()}\n\n_Click the link above to see my real-time location_`;
        }

        // Copy tracking URL to clipboard as well
        navigator.clipboard.writeText(trackingInfo.trackingUrl).then(() => {
            console.log('Tracking URL copied to clipboard');
        });

        const whatsappUrl = `https://wa.me/${trackingInfo.emergencyContact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');

        // Show notification that URL was copied
        alert(`✅ Tracking link copied to clipboard!\n\nTracking ID: ${trackingId}\n\nYou can also manually share this ID with your emergency contact.`);
    };

    const formatTimeRemaining = (minutes: number): string => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    if (loading) return null;
    if (!trackingInfo) return null;

    return (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-4 mb-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <MapPin className="w-6 h-6 text-green-600" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Live Tracking Active</h3>
                        <p className="text-xs text-gray-600">Sharing with {trackingInfo.emergencyContact.name}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-semibold text-green-700">
                        <Clock className="w-4 h-4" />
                        {formatTimeRemaining(trackingInfo.minutesRemaining)}
                    </div>
                    <p className="text-xs text-gray-500">remaining</p>
                </div>
            </div>

            {/* Last Update */}
            <div className="bg-white rounded-lg p-3 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">
                    Last updated: {new Date(trackingInfo.lastUpdate).toLocaleTimeString()}
                </span>
            </div>

            {/* Tracking ID Display */}
            <div className="bg-white rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-600 mb-1">Tracking ID (Share this with contacts):</p>
                <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono text-gray-800">
                        {trackingInfo.trackingId}
                    </code>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(trackingInfo.trackingId);
                            alert('✅ Tracking ID copied to clipboard!');
                        }}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm font-medium transition"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleShareLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition transform hover:scale-105"
                >
                    <Share2 className="w-4 h-4" />
                    Share Link
                </button>
                <button
                    onClick={handleStopTracking}
                    className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition transform hover:scale-105"
                >
                    <StopCircle className="w-4 h-4" />
                    Stop Tracking
                </button>
            </div>
        </div>
    );
}
