"use client";

import { useEffect, useState } from "react";
import { TrendingUp, PieChart, BarChart3, Activity } from "lucide-react";

interface ChartData {
    incidentTrends: { date: string; count: number }[];
    incidentTypes: { type: string; count: number; percentage: number }[];
    responseTimes: { severity: string; avgTime: number; target: number }[];
    safetyScoreTrend: { date: string; score: number }[];
}

export function DashboardCharts() {
    const [data, setData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<"7d" | "30d">("7d");

    const fetchChartData = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/security/analytics?range=${timeRange}`);
            const result = await response.json();

            if (result.success && result.data) {
                setData(result.data);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
        const interval = setInterval(fetchChartData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [timeRange]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-48 bg-gray-100 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setTimeRange("7d")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${timeRange === "7d"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Last 7 Days
                </button>
                <button
                    onClick={() => setTimeRange("30d")}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${timeRange === "30d"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                >
                    Last 30 Days
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Incident Trends Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Incident Trends
                    </h3>
                    {data?.incidentTrends && data.incidentTrends.length > 0 ? (
                        <div className="space-y-2">
                            {data.incidentTrends.slice(0, 7).map((item, index) => {
                                const maxCount = Math.max(...data.incidentTrends.map(d => d.count));
                                const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                                            <span className="font-semibold">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-blue-600 h-3 rounded-full transition-all"
                                                style={{ width: `${width}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No trend data available</p>
                    )}
                </div>

                {/* Incident Types Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-purple-600" />
                        Incident Types
                    </h3>
                    {data?.incidentTypes && data.incidentTypes.length > 0 ? (
                        <div className="space-y-3">
                            {data.incidentTypes.map((item, index) => {
                                const colors = [
                                    "bg-red-500",
                                    "bg-orange-500",
                                    "bg-yellow-500",
                                    "bg-green-500",
                                    "bg-blue-500",
                                    "bg-purple-500"
                                ];
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="capitalize font-medium">{item.type}</span>
                                            <span className="text-gray-600">
                                                {item.count} ({item.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-4">
                                            <div
                                                className={`${colors[index % colors.length]} h-4 rounded-full transition-all`}
                                                style={{ width: `${item.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No incident data available</p>
                    )}
                </div>

                {/* Response Times */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        Response Performance
                    </h3>
                    {data?.responseTimes && data.responseTimes.length > 0 ? (
                        <div className="space-y-4">
                            {data.responseTimes.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium capitalize">{item.severity} Priority</span>
                                        <span className={item.avgTime <= item.target ? "text-green-600" : "text-red-600"}>
                                            {item.avgTime.toFixed(1)}min avg
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${item.avgTime <= item.target ? "bg-green-600" : "bg-red-600"
                                                }`}
                                            style={{ width: `${Math.min(100, (item.avgTime / item.target) * 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-gray-500">Target: {item.target}min</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No response data available</p>
                    )}
                </div>

                {/* Safety Score Trend */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-indigo-600" />
                        Safety Score Trend
                    </h3>
                    {data?.safetyScoreTrend && data.safetyScoreTrend.length > 0 ? (
                        <div className="space-y-2">
                            {data.safetyScoreTrend.slice(0, 7).map((item, index) => {
                                const scoreColor =
                                    item.score >= 80
                                        ? "bg-green-600"
                                        : item.score >= 60
                                            ? "bg-yellow-600"
                                            : "bg-red-600";
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                                            <span className="font-semibold">{item.score}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className={`${scoreColor} h-3 rounded-full transition-all`}
                                                style={{ width: `${item.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No safety score data available</p>
                    )}
                </div>
            </div>
        </div>
    );
}
