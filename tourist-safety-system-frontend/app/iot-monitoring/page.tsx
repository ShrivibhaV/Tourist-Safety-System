"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslation } from "@/lib/i18n"
import { iotManager, type IoTDevice, type IoTSensorData } from "@/lib/iot-integration"
import { Camera, Wifi, WifiOff, AlertTriangle, Users, Thermometer, Wind } from "lucide-react"

export default function IoTMonitoringPage() {
  const { t } = useTranslation()
  const [devices, setDevices] = useState<IoTDevice[]>([])
  const [sensorData, setSensorData] = useState<IoTSensorData[]>([])

  useEffect(() => {
    // Initialize sample IoT devices
    const sampleDevices: IoTDevice[] = [
      {
        id: "cam-001",
        type: "camera",
        location: { lat: 40.7128, lng: -74.006, zone_id: "zone-1" },
        status: "active",
        last_ping: new Date(),
        data: { resolution: "4K", night_vision: true },
      },
      {
        id: "sensor-001",
        type: "sensor",
        location: { lat: 40.7589, lng: -73.9851, zone_id: "zone-2" },
        status: "active",
        last_ping: new Date(),
        data: { crowd_density: 0.6, noise_level: 65, temperature: 22 },
      },
      {
        id: "beacon-001",
        type: "beacon",
        location: { lat: 40.7505, lng: -73.9934, zone_id: "zone-3" },
        status: "active",
        last_ping: new Date(),
        data: { signal_strength: -45, battery: 85 },
      },
      {
        id: "emergency-001",
        type: "emergency_button",
        location: { lat: 40.7614, lng: -73.9776, zone_id: "zone-4" },
        status: "inactive",
        last_ping: new Date(Date.now() - 300000),
        data: { last_pressed: null },
      },
    ]

    sampleDevices.forEach((device) => iotManager.registerDevice(device))
    setDevices(sampleDevices)

    // Generate sample sensor data
    const sampleSensorData: IoTSensorData[] = [
      {
        device_id: "sensor-001",
        timestamp: new Date(),
        crowd_density: 0.6,
        noise_level: 65,
        temperature: 22,
        air_quality: 85,
      },
      {
        device_id: "sensor-002",
        timestamp: new Date(),
        crowd_density: 0.8,
        noise_level: 78,
        temperature: 24,
        air_quality: 72,
      },
    ]

    setSensorData(sampleSensorData)
  }, [])

  const getDeviceIcon = (type: IoTDevice["type"]) => {
    switch (type) {
      case "camera":
        return <Camera className="h-5 w-5" />
      case "sensor":
        return <Thermometer className="h-5 w-5" />
      case "beacon":
        return <Wifi className="h-5 w-5" />
      case "emergency_button":
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Wifi className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: IoTDevice["status"]) => {
    const variants = {
      active: "default",
      inactive: "destructive",
      maintenance: "secondary",
    } as const

    return (
      <Badge variant={variants[status]}>
        {status === "active" && <Wifi className="h-3 w-3 mr-1" />}
        {status === "inactive" && <WifiOff className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">IoT Device Monitoring</h1>
            <p className="text-slate-600 mt-2">Real-time monitoring of IoT devices and sensors</p>
          </div>
          <LanguageSelector />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{devices.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {devices.filter((d) => d.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Offline Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {devices.filter((d) => d.status === "inactive").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {devices.filter((d) => d.status === "maintenance").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="devices" className="space-y-4">
          <TabsList>
            <TabsTrigger value="devices">Device Status</TabsTrigger>
            <TabsTrigger value="sensors">Sensor Data</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Events</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <Card key={device.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.type)}
                        <CardTitle className="text-lg">{device.id}</CardTitle>
                      </div>
                      {getStatusBadge(device.status)}
                    </div>
                    <CardDescription>
                      {device.type.replace("_", " ").toUpperCase()} • Zone {device.location.zone_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-slate-600">
                      <strong>Location:</strong> {device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}
                    </div>
                    <div className="text-sm text-slate-600">
                      <strong>Last Ping:</strong> {device.last_ping.toLocaleTimeString()}
                    </div>
                    {device.type === "sensor" && device.data && (
                      <div className="space-y-1">
                        <div className="text-sm text-slate-600">
                          <strong>Crowd Density:</strong> {Math.round(device.data.crowd_density * 100)}%
                        </div>
                        <div className="text-sm text-slate-600">
                          <strong>Temperature:</strong> {device.data.temperature}°C
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sensors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sensorData.map((data, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5" />
                      {data.device_id}
                    </CardTitle>
                    <CardDescription>Last updated: {data.timestamp.toLocaleTimeString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.crowd_density && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">Crowd Density</span>
                        </div>
                        <Badge variant={data.crowd_density > 0.7 ? "destructive" : "default"}>
                          {Math.round(data.crowd_density * 100)}%
                        </Badge>
                      </div>
                    )}

                    {data.temperature && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">Temperature</span>
                        </div>
                        <span className="text-sm font-medium">{data.temperature}°C</span>
                      </div>
                    )}

                    {data.air_quality && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wind className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">Air Quality</span>
                        </div>
                        <Badge variant={data.air_quality < 50 ? "destructive" : "default"}>
                          {data.air_quality} AQI
                        </Badge>
                      </div>
                    )}

                    {data.noise_level && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">Noise Level</span>
                        </div>
                        <span className="text-sm font-medium">{data.noise_level} dB</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts & Events</CardTitle>
                <CardDescription>Real-time monitoring alerts from IoT devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <div className="font-medium text-red-900">High Crowd Density Alert</div>
                      <div className="text-sm text-red-700">sensor-002 detected 80% crowd density in Zone 2</div>
                    </div>
                    <div className="text-xs text-red-600">2 min ago</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <WifiOff className="h-5 w-5 text-amber-600" />
                    <div className="flex-1">
                      <div className="font-medium text-amber-900">Device Offline</div>
                      <div className="text-sm text-amber-700">emergency-001 has been offline for 5 minutes</div>
                    </div>
                    <div className="text-xs text-amber-600">5 min ago</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Camera className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-blue-900">Camera Motion Detected</div>
                      <div className="text-sm text-blue-700">cam-001 detected unusual movement patterns</div>
                    </div>
                    <div className="text-xs text-blue-600">8 min ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
