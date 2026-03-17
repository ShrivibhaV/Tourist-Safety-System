"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, User, MapPin, Clock, Plus, Edit, Eye, CheckCircle } from "lucide-react"

interface Incident {
  id: string
  touristId: string
  touristName: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  status: "reported" | "investigating" | "resolved" | "closed"
  title: string
  description: string
  location: string
  timestamp: number
  assignedOfficer?: string
}

interface IncidentManagementProps {
  incidents: Incident[]
  onUpdateIncident?: (incidentId: string, updates: Partial<Incident>) => void
  onCreateIncident?: (incident: Omit<Incident, "id" | "timestamp">) => void
}

export function IncidentManagement({ incidents, onUpdateIncident, onCreateIncident }: IncidentManagementProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newIncident, setNewIncident] = useState({
    touristId: "",
    touristName: "",
    type: "general",
    severity: "medium" as const,
    status: "reported" as const,
    title: "",
    description: "",
    location: "",
    assignedOfficer: "",
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
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
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateIncident = () => {
    if (onCreateIncident) {
      onCreateIncident(newIncident)
      setNewIncident({
        touristId: "",
        touristName: "",
        type: "general",
        severity: "medium",
        status: "reported",
        title: "",
        description: "",
        location: "",
        assignedOfficer: "",
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleUpdateStatus = (incidentId: string, newStatus: string) => {
    if (onUpdateIncident) {
      onUpdateIncident(incidentId, { status: newStatus as any })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Incident Management</h2>
          <p className="text-muted-foreground">Monitor and manage tourist safety incidents</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
              <DialogDescription>Report a new tourist safety incident</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tourist ID</label>
                  <Input
                    value={newIncident.touristId}
                    onChange={(e) => setNewIncident({ ...newIncident, touristId: e.target.value })}
                    placeholder="TST-2024-XXXXXX"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tourist Name</label>
                  <Input
                    value={newIncident.touristName}
                    onChange={(e) => setNewIncident({ ...newIncident, touristName: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Incident Type</label>
                  <Select
                    value={newIncident.type}
                    onValueChange={(value) => setNewIncident({ ...newIncident, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="medical">Medical</SelectItem>
                      <SelectItem value="theft">Theft</SelectItem>
                      <SelectItem value="harassment">Harassment</SelectItem>
                      <SelectItem value="lost">Lost Tourist</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Severity</label>
                  <Select
                    value={newIncident.severity}
                    onValueChange={(value) => setNewIncident({ ...newIncident, severity: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="Brief description of the incident"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  placeholder="Detailed description of what happened"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={newIncident.location}
                  onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                  placeholder="Where did this incident occur?"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Assigned Officer (Optional)</label>
                <Input
                  value={newIncident.assignedOfficer}
                  onChange={(e) => setNewIncident({ ...newIncident, assignedOfficer: e.target.value })}
                  placeholder="Officer name or ID"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIncident} className="bg-accent hover:bg-accent/90">
                  Create Incident
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {incidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">{incident.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                <span className="text-sm text-muted-foreground">#{incident.id}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{incident.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span>{incident.touristName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{incident.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{new Date(incident.timestamp).toLocaleString()}</span>
                </div>
                {incident.assignedOfficer && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span>Assigned: {incident.assignedOfficer}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                {incident.status !== "resolved" && incident.status !== "closed" && (
                  <Button
                    size="sm"
                    className="flex-1 bg-accent hover:bg-accent/90"
                    onClick={() => handleUpdateStatus(incident.id, "investigating")}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Respond
                  </Button>
                )}
              </div>

              {incident.status === "investigating" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 bg-green-50 border-green-200 text-green-800 hover:bg-green-100"
                    onClick={() => handleUpdateStatus(incident.id, "resolved")}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {incidents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Incidents</h3>
            <p className="text-muted-foreground">No incidents have been reported yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
