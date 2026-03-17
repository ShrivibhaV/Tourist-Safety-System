"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Shield,
  User,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Camera,
  FileText,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import loading from "../dashboard/loading"

// Mock data for officer view
const mockOfficer = {
  id: "OFF-001",
  name: "Officer Johnson",
  badge: "12345",
  department: "Metropolitan Police",
  shift: "Day Shift (8:00 AM - 4:00 PM)",
  status: "on-duty",
}

const mockAssignedIncidents = [
  {
    id: "INC-2024-001",
    touristId: "TST-2024-ABC123",
    touristName: "John Smith",
    touristPhone: "+1-555-0101",
    type: "emergency",
    severity: "critical",
    title: "Tourist reported missing",
    description: "Tourist failed to return to hotel. Last seen at Central Park around 2:00 PM.",
    location: "Central Park, NY",
    coordinates: { lat: 40.7829, lng: -73.9654 },
    timestamp: Date.now() - 1800000,
    status: "investigating",
  },
  {
    id: "INC-2024-004",
    touristId: "TST-2024-JKL012",
    touristName: "Sarah Wilson",
    touristPhone: "+44-20-1234-5678",
    type: "medical",
    severity: "high",
    title: "Medical assistance needed",
    description: "Tourist experiencing chest pain. Requesting immediate medical attention.",
    location: "Brooklyn Bridge, NY",
    coordinates: { lat: 40.7061, lng: -73.9969 },
    timestamp: Date.now() - 900000,
    status: "reported",
  },
]

export default function OfficerPortalPage() {
  const [selectedIncident, setSelectedIncident] = useState(mockAssignedIncidents[0])
  const [incidentUpdate, setIncidentUpdate] = useState("")
  const [newStatus, setNewStatus] = useState(selectedIncident.status)

  const handleUpdateIncident = () => {
    // In a real app, this would update the incident in the database
    console.log("Updating incident:", selectedIncident.id, {
      status: newStatus,
      update: incidentUpdate,
    })
    setIncidentUpdate("")
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "investigating":
        return "bg-blue-100 text-blue-800"
      case "reported":
        return "bg-orange-100 text-orange-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-accent" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Officer Portal</h1>
                  <p className="text-sm text-muted-foreground">Field Response Interface</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">On Duty</Badge>
              <div className="text-right">
                <div className="font-medium">{mockOfficer.name}</div>
                <div className="text-sm text-muted-foreground">Badge #{mockOfficer.badge}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assigned Incidents List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-accent" />
                  Assigned Incidents
                </CardTitle>
                <CardDescription>Your current case load</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAssignedIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedIncident.id === incident.id ? "border-accent bg-accent/5" : "hover:bg-muted/50"
                      }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                      <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{incident.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{incident.touristName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-accent hover:bg-accent/90">
                  <Phone className="h-4 w-4 mr-2" />
                  Emergency Dispatch
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="h-4 w-4 mr-2" />
                  File Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Incident Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-accent" />
                      Incident Details
                    </CardTitle>
                    <CardDescription>Case #{selectedIncident.id}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getSeverityColor(selectedIncident.severity)}>{selectedIncident.severity}</Badge>
                    <Badge className={getStatusColor(selectedIncident.status)}>{selectedIncident.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Incident Overview */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">{selectedIncident.title}</h3>
                  <p className="text-muted-foreground mb-4">{selectedIncident.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{selectedIncident.touristName}</div>
                          <div className="text-sm text-muted-foreground">{selectedIncident.touristId}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{selectedIncident.touristPhone}</div>
                          <div className="text-sm text-muted-foreground">Tourist Contact</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{selectedIncident.location}</div>
                          <div className="text-sm text-muted-foreground">Last Known Location</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{new Date(selectedIncident.timestamp).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Reported Time</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button className="bg-accent hover:bg-accent/90">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Tourist
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    <Navigation className="h-4 w-4 mr-2" />
                    Navigate to Location
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    <Camera className="h-4 w-4 mr-2" />
                    Add Evidence
                  </Button>
                </div>

                {/* Status Update */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Update Incident Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="reported">Reported</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Progress Update</label>
                    <Textarea
                      placeholder="Enter details about your investigation, actions taken, or resolution..."
                      value={incidentUpdate}
                      onChange={(e) => setIncidentUpdate(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleUpdateIncident} className="bg-accent hover:bg-accent/90">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Update Incident
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div >
  )
}
