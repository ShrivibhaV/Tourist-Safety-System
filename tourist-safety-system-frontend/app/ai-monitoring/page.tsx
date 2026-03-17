"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, AlertTriangle, Users, Clock, Shield, Activity, Zap, Eye, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { AnomalyResult } from "@/lib/ai-anomaly-detection"

// Mock data for demonstration
const mockAnomalies: AnomalyResult[] = [
  {
    type: "panic_pattern",
    confidence: 0.87,
    severity: "critical",
    description: "Rapid direction changes and speed bursts detected",
    dataPoints: [],
    recommendations: ["Immediate safety check required", "Consider emergency response"],
    timestamp: Date.now() - 300000, // 5 minutes ago
  },
  {
    type: "zone_violation",
    confidence: 0.92,
    severity: "high",
    description: "Entered restricted zone: Government Building",
    dataPoints: [],
    recommendations: ["Immediate notification required", "Guide tourist to safe area"],
    timestamp: Date.now() - 600000, // 10 minutes ago
  },
  {
    type: "unusual_movement",
    confidence: 0.65,
    severity: "medium",
    description: "Movement pattern deviation: 45.2 m/min above baseline",
    dataPoints: [],
    recommendations: ["Monitor closely", "Send safety check message"],
    timestamp: Date.now() - 900000, // 15 minutes ago
  },
]

const mockStats = {
  totalTourists: 1247,
  activeMonitoring: 892,
  anomaliesDetected: 23,
  criticalAlerts: 3,
  averageConfidence: 0.78,
  systemUptime: 99.7,
}

export default function AIMonitoringPage() {
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>(mockAnomalies)
  const [stats, setStats] = useState(mockStats)
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyResult | null>(null)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new anomaly detection
      if (Math.random() < 0.1) {
        // 10% chance every 5 seconds
        const newAnomaly: AnomalyResult = {
          type: ["unusual_movement", "panic_pattern", "zone_violation"][Math.floor(Math.random() * 3)] as any,
          confidence: 0.3 + Math.random() * 0.6,
          severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
          description: "New anomaly detected by AI system",
          dataPoints: [],
          recommendations: ["Investigate immediately"],
          timestamp: Date.now(),
        }

        setAnomalies((prev) => [newAnomaly, ...prev.slice(0, 9)]) // Keep last 10
        setStats((prev) => ({ ...prev, anomaliesDetected: prev.anomaliesDetected + 1 }))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "panic_pattern":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "zone_violation":
        return <Shield className="h-4 w-4 text-orange-600" />
      case "unusual_movement":
        return <Activity className="h-4 w-4 text-yellow-600" />
      case "rapid_movement":
        return <Zap className="h-4 w-4 text-purple-600" />
      case "prolonged_stationary":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

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
                <Brain className="h-8 w-8 text-accent" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">AI Anomaly Detection</h1>
                  <p className="text-sm text-muted-foreground">Real-time behavioral analysis & threat detection</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">System Active</Badge>
              <Badge variant="outline">{stats.activeMonitoring} Monitored</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
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
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Monitoring</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeMonitoring}</div>
              <p className="text-xs text-muted-foreground">Real-time tracking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Anomalies Detected</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.anomaliesDetected}</div>
              <p className="text-xs text-muted-foreground">{stats.criticalAlerts} critical alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">AI Confidence</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{(stats.averageConfidence * 100).toFixed(1)}%</div>
              <Progress value={stats.averageConfidence * 100} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="live-monitoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live-monitoring">Live Monitoring</TabsTrigger>
            <TabsTrigger value="anomaly-analysis">Anomaly Analysis</TabsTrigger>
            <TabsTrigger value="system-health">System Health</TabsTrigger>
          </TabsList>

          {/* Live Monitoring Tab */}
          <TabsContent value="live-monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Anomalies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-accent" />
                    Recent Anomalies
                  </CardTitle>
                  <CardDescription>Real-time anomaly detection results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {anomalies.slice(0, 5).map((anomaly, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedAnomaly(anomaly)}
                    >
                      {getAnomalyIcon(anomaly.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium capitalize">{anomaly.type.replace("_", " ")}</span>
                          <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.severity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{anomaly.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Confidence: {(anomaly.confidence * 100).toFixed(1)}%</span>
                          <span>{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Processing Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-accent" />
                    AI Processing Status
                  </CardTitle>
                  <CardDescription>Current system performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Processing Rate</span>
                      <span className="text-sm font-medium">847 points/min</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Model Accuracy</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm font-medium">1.2s avg</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>System Uptime</span>
                      <span className="font-medium text-green-600">{stats.systemUptime}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Anomaly Detail Modal */}
            {selectedAnomaly && (
              <Card className="border-2 border-accent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getAnomalyIcon(selectedAnomaly.type)}
                      Anomaly Details
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAnomaly(null)}>
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <div className="font-medium capitalize">{selectedAnomaly.type.replace("_", " ")}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Severity:</span>
                      <Badge className={getSeverityColor(selectedAnomaly.severity)}>{selectedAnomaly.severity}</Badge>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <div className="font-medium">{(selectedAnomaly.confidence * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Detected:</span>
                      <div className="font-medium">{new Date(selectedAnomaly.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Description:</span>
                    <p className="mt-1">{selectedAnomaly.description}</p>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Recommendations:</span>
                    <ul className="mt-1 space-y-1">
                      {selectedAnomaly.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <span className="w-1 h-1 bg-accent rounded-full"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button size="sm" className="bg-accent hover:bg-accent/90">
                      Investigate
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      Mark Resolved
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent">
                      False Positive
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Anomaly Analysis Tab */}
          <TabsContent value="anomaly-analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Types Distribution</CardTitle>
                  <CardDescription>Breakdown of detected anomaly types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "Unusual Movement", count: 12, percentage: 52 },
                      { type: "Zone Violations", count: 6, percentage: 26 },
                      { type: "Panic Patterns", count: 3, percentage: 13 },
                      { type: "Rapid Movement", count: 2, percentage: 9 },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.type}</span>
                          <span className="font-medium">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detection Accuracy</CardTitle>
                  <CardDescription>AI model performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent mb-2">94.2%</div>
                      <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-green-600">96.1%</div>
                        <p className="text-xs text-muted-foreground">Precision</p>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-blue-600">92.3%</div>
                        <p className="text-xs text-muted-foreground">Recall</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system-health" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processing Load</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-medium">67%</span>
                    </div>
                    <Progress value={67} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium">54%</span>
                    </div>
                    <Progress value={54} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Ingestion</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Model Processing</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alert Generation</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Model Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Movement Analysis</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pattern Recognition</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Risk Assessment</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
