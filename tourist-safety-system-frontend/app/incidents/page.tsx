"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, MapPin, Calendar, AlertTriangle } from "lucide-react"
import API_BASE_URL from "@/lib/api"

interface Incident {
    _id: string
    incidentType: string
    description: string
    location: {
        type: string
        coordinates: number[]
    }
    incidentDate: Date
    status: string
    createdAt: Date
}

export default function IncidentsPage() {
    const router = useRouter()
    const [incidents, setIncidents] = useState<Incident[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const touristId = localStorage.getItem("touristId")

                if (!touristId) {
                    router.push("/T-login")
                    return
                }

                const response = await fetch(`${API_BASE_URL}/api/incidents/my/${touristId}`)
                const result = await response.json()

                if (result.success) {
                    setIncidents(result.data || [])
                } else {
                    setError(result.message || "Failed to fetch incidents")
                }
            } catch (err) {
                console.error("Error fetching incidents:", err)
                setError("An error occurred while fetching your incidents")
            } finally {
                setLoading(false)
            }
        }

        fetchIncidents()
    }, [router])

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "resolved":
                return "bg-green-100 text-green-800"
            case "in progress":
                return "bg-yellow-100 text-yellow-800"
            case "pending":
                return "bg-orange-100 text-orange-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your incidents...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/T_Dashboard")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Incident Reports</h1>
                        <p className="text-gray-600">View all incidents you've reported</p>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <Card className="border-red-200 bg-red-50 mb-6">
                        <CardContent className="pt-6">
                            <p className="text-red-600">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!error && incidents.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No incidents reported</h3>
                            <p className="text-gray-600 mb-6">You haven't reported any incidents yet.</p>
                            <Button onClick={() => router.push("/T_Dashboard")} variant="outline">
                                Go to Dashboard
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Incidents List */}
                {incidents.length > 0 && (
                    <div className="space-y-4">
                        {incidents.map((incident) => (
                            <Card key={incident._id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                                {incident.incidentType || "Incident"}
                                            </CardTitle>
                                            <p className="text-sm text-gray-600">{incident.description}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                                            {incident.status || "Pending"}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>Reported: {formatDate(incident.incidentDate || incident.createdAt)}</span>
                                        </div>
                                        {incident.location && incident.location.coordinates && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>
                                                    Location: {incident.location.coordinates[1]?.toFixed(4)}, {incident.location.coordinates[0]?.toFixed(4)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
