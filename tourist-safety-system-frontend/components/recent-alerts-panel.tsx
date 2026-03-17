"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Cloud, MapPin, Bell, X } from "lucide-react";

interface Alert {
    id: string;
    type: "incident" | "weather" | "zone" | "emergency";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    message: string;
    location?: string;
    timestamp: string;
    expiresAt?: string;
}

export function RecentAlertsPanel() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const touristId = localStorage.getItem("touristId");
            if (!touristId) {
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:5000/api/dashboard/alerts/${touristId}`);
            const result = await response.json();

            if (result.success && result.data) {
                setAlerts(result.data);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const getAlertIcon = (type: string) => {
        switch (type) {
            case "weather":
                return <Cloud className="h-5 w-5" />;
            case "zone":
                return <MapPin className="h-5 w-5" />;
            case "emergency":
                return <Bell className="h-5 w-5" />;
            default:
                return <AlertTriangle className="h-5 w-5" />;
        }
    };

    const getAlertStyle = (severity: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-500 text-white border-red-600";
            case "high":
                return "bg-orange-500 text-white border-orange-600";
            case "medium":
                return "bg-yellow-400 text-gray-900 border-yellow-500";
            case "low":
                return "bg-blue-500 text-white border-blue-600";
            default:
                return "bg-gray-500 text-white border-gray-600";
        }
    };

    const handleDismiss = (alertId: string) => {
        setDismissedAlerts(prev => new Set(prev).add(alertId));
    };

    const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

    if (loading || visibleAlerts.length === 0) {
        return null;
    }

    return (
        <div className="mb-6 space-y-3">
            {visibleAlerts.map((alert) => (
                <div
                    key={alert.id}
                    className={`rounded-lg border-2 p-4 shadow-lg ${getAlertStyle(alert.severity)} animate-in slide-in-from-top`}
                >
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-base leading-tight">{alert.title}</h3>
                                <button
                                    onClick={() => handleDismiss(alert.id)}
                                    className="opacity-70 hover:opacity-100 transition-opacity"
                                    aria-label="Dismiss alert"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm mt-2 leading-snug opacity-90">{alert.message}</p>
                            {alert.location && (
                                <div className="flex items-center gap-1 mt-2 text-sm opacity-80">
                                    <MapPin className="h-4 w-4" />
                                    <span>{alert.location}</span>
                                </div>
                            )}
                            {alert.expiresAt && (
                                <p className="text-xs mt-2 opacity-75">
                                    Valid until {new Date(alert.expiresAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
