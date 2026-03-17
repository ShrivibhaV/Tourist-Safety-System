"use client";

import { X, MapPin, Clock, Shield, Battery, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface LocationSharingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEnable: (duration: number) => void;
}

export function LocationSharingDialog({
    open,
    onOpenChange,
    onEnable
}: LocationSharingDialogProps) {
    const [emergencyContact, setEmergencyContact] = useState<{ name: string; phone: string } | null>(null);
    const [duration, setDuration] = useState(8); // Default 8 hours
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open) {
            loadEmergencyContact();
        }
    }, [open]);

    const loadEmergencyContact = async () => {
        try {
            const touristId = localStorage.getItem("touristId");
            if (!touristId) return;

            const response = await fetch(`http://localhost:5000/api/dashboard/${touristId}`);
            const result = await response.json();

            if (result.success && result.data.emergencyContacts && result.data.emergencyContacts.length > 0) {
                const contact = result.data.emergencyContacts[0];
                setEmergencyContact({
                    name: contact.name,
                    phone: contact.phoneNumber
                });
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to load emergency contact:", error);
            setLoading(false);
        }
    };

    const handleEnable = () => {
        onEnable(duration);
    };

    console.log('🔍 LocationDialog render - open:', open);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full">
                                <MapPin className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Share Live Location</h2>
                                <p className="text-blue-100 text-sm">Stay connected, stay safe</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Emergency Contact Info */}
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ) : emergencyContact ? (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-2">Your location will be shared with:</p>
                            <p className="font-semibold text-gray-900 text-lg">{emergencyContact.name}</p>
                            <p className="text-sm text-gray-600">{emergencyContact.phone}</p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-gray-700">
                                No emergency contact found. Please add one in your profile.
                            </p>
                        </div>
                    )}

                    {/* Duration Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            <Clock className="w-4 h-4 inline mr-2" />
                            Tracking Duration
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {[4, 8, 12, 24].map((hours) => (
                                <button
                                    key={hours}
                                    onClick={() => setDuration(hours)}
                                    className={`py-3 px-2 rounded-lg font-medium transition ${duration === hours
                                        ? "bg-blue-600 text-white shadow-lg"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {hours}h
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* What Will Be Shared */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            What will be shared:
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Your real-time GPS location</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Movement trail on a map</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>Current address and timestamp</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-600 mt-1">✗</span>
                                <span>No personal photos or other data</span>
                            </li>
                        </ul>
                    </div>

                    {/* Battery Notice */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                        <Battery className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Battery Usage Notice</p>
                            <p className="text-xs text-gray-600">
                                GPS tracking uses battery power. For best results, keep your phone charged or use power-saving mode after enabling tracking.
                            </p>
                        </div>
                    </div>

                    {/* Privacy Info */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Your Privacy Matters</p>
                            <p className="text-xs text-gray-600">
                                Only your emergency contact can view your location. Tracking automatically stops after {duration} hours. You can stop it anytime.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 rounded-b-2xl space-y-3">
                    <button
                        onClick={handleEnable}
                        disabled={!emergencyContact}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        <MapPin className="w-5 h-5" />
                        Enable Live Tracking ({duration}h)
                    </button>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Not Now
                    </button>
                </div>
            </div>
        </div>
    );
}
