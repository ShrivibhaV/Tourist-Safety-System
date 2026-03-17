"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Download,
  Bell,
  Settings,
  Eye,
  Phone,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { AnomalyAlert } from "@/components/anomaly-alert"
import type { AnomalyResult } from "@/lib/ai-anomaly-detection"

// Mock data for demonstration
const mockStats = {
  totalTourists: 1247,
  activeTourists: 892,
  totalIncidents: 23,
  openIncidents: 7,
  resolvedIncidents: 16,
  averageResponseTime: 4.2,
  safetyScore: 87,
  criticalAlerts: 3,
}

const mockIncidents = [
  {
    id: "INC-2024-001",
    touristId: "TST-2024-ABC123",
    touristName: "John Smith",
    type: "emergency",
    severity: "critical",
    status: "investigating",
    title: "Tourist reported missing",
    location: "Central Park, NY",
    timestamp: Date.now() - 1800000, // 30 minutes ago
    assignedOfficer: "Officer Johnson",
  },
  {
    id: "INC-2024-002",
    touristId: "TST-2024-DEF456",
    touristName: "Maria Garcia",
    type: "medical",
    severity: "high",
    status: "resolved",
    title: "Medical assistance requested",
    location: "Times Square, NY",
    timestamp: Date.now() - 3600000, // 1 hour ago
    assignedOfficer: "Officer Williams",
  },
  {
    id: "INC-2024-003",
    touristId: "TST-2024-GHI789",
    touristName: "Hans Mueller",
    type: "theft",
    severity: "medium",
    status: "reported",
    title: "Wallet stolen",
    location: "Brooklyn Bridge, NY",
    timestamp: Date.now() - 7200000, // 2 hours ago
    assignedOfficer: null,
  },
]

const mockAnomalies: AnomalyResult[] = [
  {
    type: "panic_pattern",
    confidence: 0.87,
    severity: "critical",
    description: "Rapid direction changes and speed bursts detected",
    dataPoints: [],
    recommendations: ["Immediate safety check required", "Consider emergency response"],
    timestamp: Date.now() - 300000,
  },
  {
    type: "zone_violation",
    confidence: 0.92,
    severity: "high",
    description: "Entered restricted zone: Government Building",
    dataPoints: [],
    recommendations: ["Immediate notification required", "Guide tourist to safe area"],
    timestamp: Date.now() - 600000,
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalTourists: 0,
    activeTourists: 0,
    totalIncidents: 0,
    openIncidents: 0,
    resolvedIncidents: 0,
    averageResponseTime: 0,
    safetyScore: 0,
    criticalAlerts: 0,
  })
  const [incidents, setIncidents] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState(mockAnomalies)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedIncident, setSelectedIncident] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real data from backend
  useEffect(() => {
    fetchDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/security/stats')
      const statsResult = await statsResponse.json()

      if (statsResult.success) {
        setStats(statsResult.data)
      }

      // Fetch incidents
      const incidentsResponse = await fetch('http://localhost:5000/api/security/incidents?limit=100')
      const incidentsResult = await incidentsResponse.json()

      if (incidentsResult.success) {
        // Transform to match frontend format
        const transformedIncidents = incidentsResult.data.map((inc: any) => ({
          id: inc.id,
          touristId: inc.touristId,
          touristName: inc.touristName,
          type: inc.type,
          severity: inc.severity.toLowerCase(),
          status: inc.status.toLowerCase().replace(' ', '-'),
          title: inc.title,
          location: inc.location,
          timestamp: new Date(inc.timestamp).getTime(),
          assignedOfficer: inc.assignedOfficer
        }))
        setIncidents(transformedIncidents)
      }

      setLoading(false)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
      case "investigating":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
      case "reported":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.touristName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.title.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || incident.status === filterStatus

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-accent" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
                  <p className="text-sm text-muted-foreground">Tourism Department & Police Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Alerts ({stats.criticalAlerts})
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Dashboard Overview</h2>
          {loading ? (
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : (
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tourists</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTourists.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeTourists}</div>
              <p className="text-xs text-muted-foreground">Currently being monitored</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open Incidents</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.openIncidents}</div>
              <p className="text-xs text-muted-foreground">{stats.resolvedIncidents} resolved today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Safety Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.safetyScore}</div>
              <p className="text-xs text-muted-foreground">Avg response: {stats.averageResponseTime}min</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
          </TabsList>

          {/* Incidents Tab */}
          <TabsContent value="incidents" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search incidents, tourists, or IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {filteredIncidents.map((incident) => (
                <Card
                  key={incident.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedIncident(incident)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {getSeverityIcon(incident.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{incident.title}</h3>
                            <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                            <Badge className={getStatusColor(incident.severity)}>{incident.severity}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium">Tourist:</span> {incident.touristName}
                            </div>
                            <div>
                              <span className="font-medium">ID:</span> {incident.touristId}
                            </div>
                            <div>
                              <span className="font-medium">Location:</span> {incident.location}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(incident.timestamp).toLocaleString()}
                            </div>
                            {incident.assignedOfficer && (
                              <div>
                                <span className="font-medium">Assigned:</span> {incident.assignedOfficer}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {incident.status !== "resolved" && (
                          <Button size="sm" className="bg-accent hover:bg-accent/90">
                            <Phone className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            {/* Live Tourist Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Live Tourist Tracking
                </CardTitle>
                <CardDescription>Real-time location monitoring system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg p-12 text-center">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-xl font-semibold mb-2">Active Monitoring</p>
                  <p className="text-3xl font-bold text-accent mb-2">{stats.activeTourists}</p>
                  <p className="text-sm text-muted-foreground">
                    Tourists currently tracked via live location sharing
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6">

              {/* Active Tourists Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Tourist Summary</CardTitle>
                  <CardDescription>Currently monitored tourists and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {stats.activeTourists || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {stats.openIncidents || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Need Attention</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 mb-1">
                        {stats.criticalAlerts || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Critical Alerts</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Incident Trends
                  </CardTitle>
                  <CardDescription>Weekly incident analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Calculate real incident type distribution */}
                    {(() => {
                      const typeCounts: any = {};
                      incidents.forEach((inc: any) => {
                        const type = inc.type || 'Other';
                        typeCounts[type] = (typeCounts[type] || 0) + 1;
                      });

                      const typeData = Object.entries(typeCounts).map(([type, count]) => ({
                        type: type.charAt(0).toUpperCase() + type.slice(1),
                        count,
                        total: incidents.length
                      }));

                      return typeData.length > 0 ? typeData.map((item: any, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{item.type}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.count}</span>
                            <span className="text-xs text-muted-foreground">
                              ({Math.round((item.count / item.total) * 100)}%)
                            </span>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center text-muted-foreground text-sm py-4">
                          No incident data available
                        </div>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Performance</CardTitle>
                  <CardDescription>Average response times by incident type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "Critical", time: 2.1, target: 3.0 },
                      { type: "High", time: 4.8, target: 5.0 },
                      { type: "Medium", time: 8.2, target: 10.0 },
                      { type: "Low", time: 15.5, target: 20.0 },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.type} Priority</span>
                          <span className="font-medium">{item.time}min avg</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.time <= item.target ? "bg-green-600" : "bg-red-600"}`}
                            style={{ width: `${Math.min(100, (item.time / item.target) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Overall system health and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Connection</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI Monitoring</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Location Services</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emergency Services</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-accent hover:bg-accent/90">
                    <Bell className="h-4 w-4 mr-2" />
                    Send Safety Alert
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Officers
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Safety Zones
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
