"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, MapPin, Clock, TrendingUp, Shield, Info } from "lucide-react";
import API_BASE_URL from "@/lib/api";

interface ActivityItem {
    id: string;
    type: "incident" | "alert" | "safety_tip" | "update";
    title: string;
    description: string;
    location?: string;
    severity?: "low" | "medium" | "high" | "critical";
    timestamp: string;
    distance?: number;
}

export function ActivityFeed() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        try {
            const touristId = localStorage.getItem("touristId");
            if (!touristId) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/dashboard/activities/${touristId}`);
            const result = await response.json();

            if (result.success && result.data) {
                setActivities(result.data);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchActivities, 30000);
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "incident":
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case "alert":
                return <AlertTriangle className="h-5 w-5 text-orange-500" />;
            case "safety_tip":
                return <Shield className="h-5 w-5 text-blue-500" />;
            case "update":
                return <Info className="h-5 w-5 text-green-500" />;
            default:
                return <Info className="h-5 w-5 text-gray-500" />;
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 border-red-300 text-red-800";
            case "high":
                return "bg-orange-100 border-orange-300 text-orange-800";
            case "medium":
                return "bg-yellow-100 border-yellow-300 text-yellow-800";
            case "low":
                return "bg-blue-100 border-blue-300 text-blue-800";
            default:
                return "bg-gray-100 border-gray-300 text-gray-800";
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date().getTime();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4 h-20"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Recent Activity
                </h2>
                <span className="text-xs text-gray-500">Auto-updates every 30s</span>
            </div>

            {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No recent activity in your area</p>
                    <p className="text-sm mt-1">You're in a safe zone!</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className={`border rounded-lg p-4 transition-all hover:shadow-md ${activity.severity ? getSeverityColor(activity.severity) : "bg-gray-50 border-gray-200"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">{getIcon(activity.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-sm leading-tight">{activity.title}</h3>
                                        <span className="text-xs whitespace-nowrap flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {getTimeAgo(activity.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1 leading-snug">{activity.description}</p>
                                    {activity.location && (
                                        <div className="flex items-center gap-1 mt-2 text-xs">
                                            <MapPin className="h-3 w-3" />
                                            <span>{activity.location}</span>
                                            {activity.distance !== undefined && (
                                                <span className="ml-2 text-gray-600">
                                                    ({activity.distance < 1
                                                        ? `${Math.round(activity.distance * 1000)}m away`
                                                        : `${activity.distance.toFixed(1)}km away`})
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
