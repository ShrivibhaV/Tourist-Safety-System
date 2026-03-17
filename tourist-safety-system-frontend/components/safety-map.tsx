"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, AlertTriangle, Shield, Users } from "lucide-react"
import Image from "next/image"

interface SafetyZone {
  id: string
  name: string
  type: "safe" | "caution" | "restricted"
  distance: number
  description: string
}

interface SafetyMapProps {
  userLocation?: {
    latitude: number
    longitude: number
  }
}

export function SafetyMap({ userLocation }: SafetyMapProps) {
  const [zones, setZones] = useState<SafetyZone[]>([
    {
      id: "1",
      name: "Times Square Tourist Center",
      type: "safe",
      distance: 0.2,
      description: "24/7 security, tourist information, emergency services",
    },
    {
      id: "2",
      name: "NYPD Station - Midtown",
      type: "safe",
      distance: 0.4,
      description: "Police station with tourist assistance desk",
    },
    {
      id: "3",
      name: "Construction Zone - 42nd St",
      type: "caution",
      distance: 0.3,
      description: "Active construction, use alternative routes",
    },
    {
      id: "4",
      name: "Restricted Area - Government Building",
      type: "restricted",
      distance: 0.8,
      description: "No civilian access, security checkpoint required",
    },
  ])

  const getZoneIcon = (type: string) => {
    switch (type) {
      case "safe":
        return <Shield className="h-4 w-4 text-green-600" />
      case "caution":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "restricted":
        return <Users className="h-4 w-4 text-red-600" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getZoneBadge = (type: string) => {
    switch (type) {
      case "safe":
        return <Badge className="bg-green-100 text-green-800">Safe Zone</Badge>
      case "caution":
        return <Badge className="bg-yellow-100 text-yellow-800">Caution</Badge>
      case "restricted":
        return <Badge className="bg-red-100 text-red-800">Restricted</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-professional border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <div className="p-2 gradient-primary rounded-lg">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            Interactive Safety Map
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 bg-muted rounded-lg relative overflow-hidden">
            <Image
              src="/mobile-app-interface-showing-safety-map-with-locat.jpg"
              alt="Interactive Safety Map"
              fill
              className="object-cover opacity-90"
            />

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-5 h-5 bg-primary rounded-full border-3 border-white shadow-professional"></div>
              <div className="w-10 h-10 bg-primary/30 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>

            <div className="absolute top-1/4 left-1/4 z-10">
              <div className="w-4 h-4 bg-success rounded-full border-2 border-white shadow-professional"></div>
            </div>
            <div className="absolute top-3/4 right-1/4 z-10">
              <div className="w-4 h-4 bg-warning rounded-full border-2 border-white shadow-professional"></div>
            </div>
            <div className="absolute bottom-1/4 left-3/4 z-10">
              <div className="w-4 h-4 bg-destructive rounded-full border-2 border-white shadow-professional"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-foreground">Nearby Safety Zones</h3>
        {zones.map((zone) => (
          <Card
            key={zone.id}
            className="hover:shadow-professional transition-all duration-300 hover:-translate-y-1 border-border/50"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-muted rounded-xl">{getZoneIcon(zone.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg text-foreground">{zone.name}</h4>
                      {getZoneBadge(zone.type)}
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{zone.description}</p>
                    <div className="flex items-center gap-6">
                      <span className="text-sm font-semibold text-primary">{zone.distance} mi away</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/20 text-primary hover:bg-primary/5 bg-transparent"
                      >
                        <Navigation className="h-3 w-3 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
