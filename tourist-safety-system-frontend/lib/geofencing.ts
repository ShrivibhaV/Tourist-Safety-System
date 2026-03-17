// Geofencing utilities for safety zone monitoring

export interface GeofenceZone {
  id: string
  name: string
  type: "safe" | "caution" | "restricted" | "emergency"
  center: {
    latitude: number
    longitude: number
  }
  radius: number // in meters
  riskLevel: number // 1-5 scale
  description?: string
  activeHours?: {
    start: string
    end: string
  }[]
}

export interface LocationPoint {
  latitude: number
  longitude: number
  timestamp?: number
}

export class GeofencingService {
  private static instance: GeofencingService
  private zones: Map<string, GeofenceZone> = new Map()
  private watchId: number | null = null
  private callbacks: ((zone: GeofenceZone, entered: boolean) => void)[] = []

  static getInstance(): GeofencingService {
    if (!GeofencingService.instance) {
      GeofencingService.instance = new GeofencingService()
    }
    return GeofencingService.instance
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(point1: LocationPoint, point2: LocationPoint): number {
    const R = 6371000 // Earth's radius in meters
    const lat1Rad = (point1.latitude * Math.PI) / 180
    const lat2Rad = (point2.latitude * Math.PI) / 180
    const deltaLatRad = ((point2.latitude - point1.latitude) * Math.PI) / 180
    const deltaLngRad = ((point2.longitude - point1.longitude) * Math.PI) / 180

    const a =
      Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Add a geofence zone
  addZone(zone: GeofenceZone): void {
    this.zones.set(zone.id, zone)
  }

  // Remove a geofence zone
  removeZone(zoneId: string): void {
    this.zones.delete(zoneId)
  }

  // Get all zones
  getZones(): GeofenceZone[] {
    return Array.from(this.zones.values())
  }

  // Check if a point is inside a zone
  isPointInZone(point: LocationPoint, zone: GeofenceZone): boolean {
    const distance = this.calculateDistance(point, zone.center)
    return distance <= zone.radius
  }

  // Get zones that contain a specific point
  getZonesForPoint(point: LocationPoint): GeofenceZone[] {
    return this.getZones().filter((zone) => this.isPointInZone(point, zone))
  }

  // Get nearby zones within a certain distance
  getNearbyZones(point: LocationPoint, maxDistance = 1000): Array<GeofenceZone & { distance: number }> {
    return this.getZones()
      .map((zone) => ({
        ...zone,
        distance: this.calculateDistance(point, zone.center),
      }))
      .filter((zone) => zone.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance)
  }

  // Check if zone is currently active based on time
  isZoneActive(zone: GeofenceZone): boolean {
    if (!zone.activeHours || zone.activeHours.length === 0) {
      return true // Always active if no time restrictions
    }

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    return zone.activeHours.some((hours) => {
      const [startHour, startMin] = hours.start.split(":").map(Number)
      const [endHour, endMin] = hours.end.split(":").map(Number)
      const startTime = startHour * 60 + startMin
      const endTime = endHour * 60 + endMin

      if (startTime <= endTime) {
        return currentTime >= startTime && currentTime <= endTime
      } else {
        // Crosses midnight
        return currentTime >= startTime || currentTime <= endTime
      }
    })
  }

  // Calculate safety score based on current location and nearby zones
  calculateSafetyScore(point: LocationPoint): number {
    const nearbyZones = this.getNearbyZones(point, 500) // 500m radius

    if (nearbyZones.length === 0) {
      return 75 // Neutral score if no zones nearby
    }

    let totalScore = 0
    let weightSum = 0

    nearbyZones.forEach((zone) => {
      if (!this.isZoneActive(zone)) return

      // Weight decreases with distance
      const weight = Math.max(0, 1 - zone.distance / 500)

      let zoneScore: number
      switch (zone.type) {
        case "safe":
          zoneScore = 95
          break
        case "caution":
          zoneScore = 60
          break
        case "restricted":
          zoneScore = 30
          break
        case "emergency":
          zoneScore = 100
          break
        default:
          zoneScore = 75
      }

      // Adjust by risk level
      zoneScore = Math.max(0, zoneScore - (zone.riskLevel - 1) * 10)

      totalScore += zoneScore * weight
      weightSum += weight
    })

    return weightSum > 0 ? Math.round(totalScore / weightSum) : 75
  }

  // Start monitoring location for geofence events
  startMonitoring(callback: (zone: GeofenceZone, entered: boolean) => void): void {
    this.callbacks.push(callback)

    if (this.watchId === null && "geolocation" in navigator) {
      let lastKnownZones: Set<string> = new Set()

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const currentPoint: LocationPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
          }

          const currentZones = new Set(
            this.getZonesForPoint(currentPoint)
              .filter((zone) => this.isZoneActive(zone))
              .map((zone) => zone.id),
          )

          // Check for zone entries
          currentZones.forEach((zoneId) => {
            if (!lastKnownZones.has(zoneId)) {
              const zone = this.zones.get(zoneId)
              if (zone) {
                this.callbacks.forEach((cb) => cb(zone, true))
              }
            }
          })

          // Check for zone exits
          lastKnownZones.forEach((zoneId) => {
            if (!currentZones.has(zoneId)) {
              const zone = this.zones.get(zoneId)
              if (zone) {
                this.callbacks.forEach((cb) => cb(zone, false))
              }
            }
          })

          lastKnownZones = currentZones
        },
        (error) => {
          console.error("Geolocation error:", error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        },
      )
    }
  }

  // Stop monitoring location
  stopMonitoring(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    this.callbacks = []
  }

  // Initialize with default safety zones
  initializeDefaultZones(): void {
    const defaultZones: GeofenceZone[] = [
      {
        id: "safe-zone-1",
        name: "Times Square Tourist Center",
        type: "safe",
        center: { latitude: 40.758, longitude: -73.9855 },
        radius: 200,
        riskLevel: 1,
        description: "24/7 security and tourist information",
      },
      {
        id: "safe-zone-2",
        name: "Central Park South",
        type: "safe",
        center: { latitude: 40.7676, longitude: -73.9789 },
        radius: 300,
        riskLevel: 1,
        description: "Well-patrolled tourist area",
      },
      {
        id: "caution-zone-1",
        name: "Construction Area - 42nd Street",
        type: "caution",
        center: { latitude: 40.7549, longitude: -73.984 },
        radius: 150,
        riskLevel: 3,
        description: "Active construction, use alternative routes",
      },
      {
        id: "restricted-zone-1",
        name: "Government Building Perimeter",
        type: "restricted",
        center: { latitude: 40.7505, longitude: -73.9934 },
        radius: 100,
        riskLevel: 5,
        description: "Restricted access, security checkpoint required",
      },
    ]

    defaultZones.forEach((zone) => this.addZone(zone))
  }
}

// Export singleton instance
export const geofencingService = GeofencingService.getInstance()
