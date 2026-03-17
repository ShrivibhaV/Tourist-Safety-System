// AI-powered anomaly detection system for tourist safety monitoring

export interface LocationDataPoint {
  latitude: number
  longitude: number
  timestamp: number
  accuracy?: number
  speed?: number
  heading?: number
}

export interface BehaviorPattern {
  movementSpeed: number
  stationaryTime: number
  routeDeviation: number
  timeOfDay: number
  locationRiskScore: number
}

export interface AnomalyResult {
  type: "unusual_movement" | "panic_pattern" | "zone_violation" | "prolonged_stationary" | "rapid_movement"
  confidence: number
  severity: "low" | "medium" | "high" | "critical"
  description: string
  dataPoints: LocationDataPoint[]
  recommendations: string[]
  timestamp: number
}

export class AIAnomalyDetector {
  private static instance: AIAnomalyDetector
  private locationHistory: Map<string, LocationDataPoint[]> = new Map()
  private behaviorBaselines: Map<string, BehaviorPattern> = new Map()
  private readonly HISTORY_LIMIT = 100
  private readonly ANALYSIS_WINDOW = 30 // minutes

  static getInstance(): AIAnomalyDetector {
    if (!AIAnomalyDetector.instance) {
      AIAnomalyDetector.instance = new AIAnomalyDetector()
    }
    return AIAnomalyDetector.instance
  }

  // Add location data point for a tourist
  addLocationData(touristId: string, dataPoint: LocationDataPoint): void {
    if (!this.locationHistory.has(touristId)) {
      this.locationHistory.set(touristId, [])
    }

    const history = this.locationHistory.get(touristId)!
    history.push(dataPoint)

    // Keep only recent history
    if (history.length > this.HISTORY_LIMIT) {
      history.splice(0, history.length - this.HISTORY_LIMIT)
    }

    // Update behavior baseline
    this.updateBehaviorBaseline(touristId)
  }

  // Analyze location data for anomalies
  analyzeForAnomalies(touristId: string): AnomalyResult[] {
    const history = this.locationHistory.get(touristId)
    if (!history || history.length < 5) {
      return [] // Need minimum data points
    }

    const anomalies: AnomalyResult[] = []
    const recentData = this.getRecentData(history)

    // Check for various anomaly types
    anomalies.push(...this.detectUnusualMovement(touristId, recentData))
    anomalies.push(...this.detectPanicPattern(touristId, recentData))
    anomalies.push(...this.detectZoneViolation(touristId, recentData))
    anomalies.push(...this.detectProlongedStationary(touristId, recentData))
    anomalies.push(...this.detectRapidMovement(touristId, recentData))

    return anomalies.filter((anomaly) => anomaly.confidence > 0.3) // Filter low confidence
  }

  // Get recent data within analysis window
  private getRecentData(history: LocationDataPoint[]): LocationDataPoint[] {
    const cutoffTime = Date.now() - this.ANALYSIS_WINDOW * 60 * 1000
    return history.filter((point) => point.timestamp >= cutoffTime)
  }

  // Update behavior baseline for a tourist
  private updateBehaviorBaseline(touristId: string): void {
    const history = this.locationHistory.get(touristId)
    if (!history || history.length < 10) return

    const recentHistory = history.slice(-20) // Last 20 points
    const pattern = this.calculateBehaviorPattern(recentHistory)
    this.behaviorBaselines.set(touristId, pattern)
  }

  // Calculate behavior pattern from location data
  private calculateBehaviorPattern(data: LocationDataPoint[]): BehaviorPattern {
    let totalSpeed = 0
    let stationaryTime = 0
    const routeDeviation = 0
    let speedCount = 0

    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1]
      const curr = data[i]

      const distance = this.calculateDistance(prev, curr)
      const timeDiff = (curr.timestamp - prev.timestamp) / 1000 / 60 // minutes

      if (timeDiff > 0) {
        const speed = distance / timeDiff // meters per minute
        totalSpeed += speed
        speedCount++

        if (speed < 10) {
          // Less than 10 m/min considered stationary
          stationaryTime += timeDiff
        }
      }
    }

    const avgSpeed = speedCount > 0 ? totalSpeed / speedCount : 0
    const timeOfDay = new Date().getHours()

    return {
      movementSpeed: avgSpeed,
      stationaryTime,
      routeDeviation: 0, // Simplified for demo
      timeOfDay,
      locationRiskScore: this.calculateLocationRiskScore(data[data.length - 1]),
    }
  }

  // Detect unusual movement patterns
  private detectUnusualMovement(touristId: string, data: LocationDataPoint[]): AnomalyResult[] {
    const baseline = this.behaviorBaselines.get(touristId)
    if (!baseline || data.length < 5) return []

    const currentPattern = this.calculateBehaviorPattern(data)
    const speedDeviation = Math.abs(currentPattern.movementSpeed - baseline.movementSpeed)

    if (speedDeviation > baseline.movementSpeed * 2) {
      // 200% deviation
      return [
        {
          type: "unusual_movement",
          confidence: Math.min(0.9, speedDeviation / baseline.movementSpeed / 2),
          severity: speedDeviation > baseline.movementSpeed * 3 ? "high" : "medium",
          description: `Unusual movement pattern detected. Speed deviation: ${speedDeviation.toFixed(1)} m/min`,
          dataPoints: data,
          recommendations: [
            "Check if tourist is in distress",
            "Verify current location safety",
            "Consider sending safety check message",
          ],
          timestamp: Date.now(),
        },
      ]
    }

    return []
  }

  // Detect panic-like movement patterns
  private detectPanicPattern(touristId: string, data: LocationDataPoint[]): AnomalyResult[] {
    if (data.length < 8) return []

    let rapidDirectionChanges = 0
    let highSpeedBursts = 0

    for (let i = 2; i < data.length; i++) {
      const prev2 = data[i - 2]
      const prev1 = data[i - 1]
      const curr = data[i]

      // Check for rapid direction changes
      const bearing1 = this.calculateBearing(prev2, prev1)
      const bearing2 = this.calculateBearing(prev1, curr)
      const bearingDiff = Math.abs(bearing1 - bearing2)

      if (bearingDiff > 90 && bearingDiff < 270) {
        rapidDirectionChanges++
      }

      // Check for high speed bursts
      const distance = this.calculateDistance(prev1, curr)
      const timeDiff = (curr.timestamp - prev1.timestamp) / 1000 / 60
      const speed = timeDiff > 0 ? distance / timeDiff : 0

      if (speed > 200) {
        // > 200 m/min (fast walking/running)
        highSpeedBursts++
      }
    }

    const panicScore = rapidDirectionChanges * 0.3 + highSpeedBursts * 0.4

    if (panicScore > 2) {
      return [
        {
          type: "panic_pattern",
          confidence: Math.min(0.95, panicScore / 5),
          severity: panicScore > 4 ? "critical" : "high",
          description: `Potential panic behavior detected. Rapid changes: ${rapidDirectionChanges}, Speed bursts: ${highSpeedBursts}`,
          dataPoints: data,
          recommendations: [
            "Immediate safety check required",
            "Consider emergency response",
            "Contact tourist directly",
            "Alert nearby security personnel",
          ],
          timestamp: Date.now(),
        },
      ]
    }

    return []
  }

  // Detect zone violations
  private detectZoneViolation(touristId: string, data: LocationDataPoint[]): AnomalyResult[] {
    const violations: AnomalyResult[] = []

    // Mock restricted zones for demo
    const restrictedZones = [
      { lat: 40.7505, lng: -73.9934, radius: 100, name: "Government Building" },
      { lat: 40.7831, lng: -73.9712, radius: 150, name: "Military Installation" },
    ]

    data.forEach((point) => {
      restrictedZones.forEach((zone) => {
        const distance = this.calculateDistance(
          { latitude: point.latitude, longitude: point.longitude },
          { latitude: zone.lat, longitude: zone.lng },
        )

        if (distance <= zone.radius) {
          violations.push({
            type: "zone_violation",
            confidence: 0.9,
            severity: "high",
            description: `Entered restricted zone: ${zone.name}`,
            dataPoints: [point],
            recommendations: [
              "Immediate notification required",
              "Guide tourist to safe area",
              "Contact security personnel",
              "Log incident for review",
            ],
            timestamp: Date.now(),
          })
        }
      })
    })

    return violations
  }

  // Detect prolonged stationary behavior
  private detectProlongedStationary(touristId: string, data: LocationDataPoint[]): AnomalyResult[] {
    if (data.length < 10) return []

    const stationaryThreshold = 50 // meters
    const timeThreshold = 60 // minutes

    let stationaryStart: LocationDataPoint | null = null
    let stationaryDuration = 0

    for (let i = 1; i < data.length; i++) {
      const distance = this.calculateDistance(data[i - 1], data[i])

      if (distance < stationaryThreshold) {
        if (!stationaryStart) {
          stationaryStart = data[i - 1]
        }
        stationaryDuration = (data[i].timestamp - stationaryStart.timestamp) / 1000 / 60
      } else {
        stationaryStart = null
        stationaryDuration = 0
      }
    }

    if (stationaryDuration > timeThreshold) {
      const riskScore = this.calculateLocationRiskScore(data[data.length - 1])

      return [
        {
          type: "prolonged_stationary",
          confidence: Math.min(0.8, stationaryDuration / timeThreshold / 2),
          severity: riskScore > 3 ? "high" : "medium",
          description: `Stationary for ${stationaryDuration.toFixed(1)} minutes in ${riskScore > 3 ? "high-risk" : "normal"} area`,
          dataPoints: data.slice(-5),
          recommendations: [
            "Check tourist welfare",
            "Send safety check message",
            "Verify location safety",
            "Consider assistance offer",
          ],
          timestamp: Date.now(),
        },
      ]
    }

    return []
  }

  // Detect rapid movement (possible emergency evacuation)
  private detectRapidMovement(touristId: string, data: LocationDataPoint[]): AnomalyResult[] {
    if (data.length < 5) return []

    const rapidMovementThreshold = 300 // m/min (fast running)
    let rapidMovementCount = 0
    let maxSpeed = 0

    for (let i = 1; i < data.length; i++) {
      const distance = this.calculateDistance(data[i - 1], data[i])
      const timeDiff = (data[i].timestamp - data[i - 1].timestamp) / 1000 / 60
      const speed = timeDiff > 0 ? distance / timeDiff : 0

      maxSpeed = Math.max(maxSpeed, speed)

      if (speed > rapidMovementThreshold) {
        rapidMovementCount++
      }
    }

    if (rapidMovementCount >= 3 || maxSpeed > 500) {
      return [
        {
          type: "rapid_movement",
          confidence: Math.min(0.9, Math.max(rapidMovementCount / 5, maxSpeed / 1000)),
          severity: maxSpeed > 500 ? "critical" : "high",
          description: `Rapid movement detected. Max speed: ${maxSpeed.toFixed(1)} m/min`,
          dataPoints: data,
          recommendations: [
            "Immediate safety assessment",
            "Check for emergency situation",
            "Contact tourist urgently",
            "Alert emergency services if needed",
          ],
          timestamp: Date.now(),
        },
      ]
    }

    return []
  }

  // Calculate distance between two points (Haversine formula)
  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number },
  ): number {
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

  // Calculate bearing between two points
  private calculateBearing(point1: LocationDataPoint, point2: LocationDataPoint): number {
    const lat1Rad = (point1.latitude * Math.PI) / 180
    const lat2Rad = (point2.latitude * Math.PI) / 180
    const deltaLngRad = ((point2.longitude - point1.longitude) * Math.PI) / 180

    const y = Math.sin(deltaLngRad) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLngRad)

    const bearing = Math.atan2(y, x)
    return ((bearing * 180) / Math.PI + 360) % 360
  }

  // Calculate location risk score based on various factors
  private calculateLocationRiskScore(point: LocationDataPoint): number {
    // Mock implementation - in real system would use crime data, time of day, etc.
    const timeOfDay = new Date(point.timestamp).getHours()
    let riskScore = 1

    // Higher risk during late night/early morning
    if (timeOfDay >= 22 || timeOfDay <= 5) {
      riskScore += 2
    }

    // Mock high-risk areas (would be based on real data)
    const highRiskAreas = [
      { lat: 40.7282, lng: -73.9942, radius: 200 }, // Mock high-crime area
    ]

    highRiskAreas.forEach((area) => {
      const distance = this.calculateDistance(point, { latitude: area.lat, longitude: area.lng })
      if (distance <= area.radius) {
        riskScore += 2
      }
    })

    return Math.min(5, riskScore)
  }

  // Get tourist behavior summary
  getTouristBehaviorSummary(touristId: string): {
    totalDataPoints: number
    averageSpeed: number
    riskScore: number
    lastUpdate: number
    recentAnomalies: number
  } | null {
    const history = this.locationHistory.get(touristId)
    const baseline = this.behaviorBaselines.get(touristId)

    if (!history || !baseline) return null

    const recentAnomalies = this.analyzeForAnomalies(touristId).length

    return {
      totalDataPoints: history.length,
      averageSpeed: baseline.movementSpeed,
      riskScore: baseline.locationRiskScore,
      lastUpdate: history[history.length - 1]?.timestamp || 0,
      recentAnomalies,
    }
  }

  // Clear data for a tourist (privacy compliance)
  clearTouristData(touristId: string): void {
    this.locationHistory.delete(touristId)
    this.behaviorBaselines.delete(touristId)
  }
}

// Export singleton instance
export const aiAnomalyDetector = AIAnomalyDetector.getInstance()
