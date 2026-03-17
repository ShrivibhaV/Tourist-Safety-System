// Type definitions for the Tourist Safety System

import type { GeoJSON } from "geojson"

export interface Tourist {
  id: string
  digitalId: string
  blockchainHash?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  nationality: string
  passportNumber: string
  emergencyContactName: string
  emergencyContactPhone: string
  preferredLanguage: string
  safetyScore: number
  photo: File | null
  currentLocation?: {
    latitude: number
    longitude: number
    address?: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SafetyZone {
  id: string
  name: string
  description?: string
  zoneType: "safe" | "caution" | "restricted" | "emergency"
  coordinates: GeoJSON.Polygon
  riskLevel: number
  activeHours?: {
    start: string
    end: string
  }[]
  createdBy?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Incident {
  id: string
  touristId: string
  incidentType: "emergency" | "medical" | "theft" | "harassment" | "lost"
  severity: "low" | "medium" | "high" | "critical"
  status: "reported" | "investigating" | "resolved" | "closed"
  title: string
  description?: string
  location: {
    latitude: number
    longitude: number
    address?: string
  }
  mediaUrls?: string[]
  assignedOfficerId?: string
  responseTimeMinutes?: number
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface LocationHistory {
  id: string
  touristId: string
  latitude: number
  longitude: number
  accuracy?: number
  zoneId?: string
  isSafeZone: boolean
  timestamp: string
}

export interface AnomalyDetection {
  id: string
  touristId: string
  anomalyType: "unusual_movement" | "panic_pattern" | "zone_violation"
  confidenceScore: number
  dataPoints: Record<string, any>
  location?: {
    latitude: number
    longitude: number
  }
  autoResolved: boolean
  reviewedBy?: string
  createdAt: string
}

export interface SystemUser {
  id: string
  username: string
  email: string
  role: "admin" | "police_officer" | "tourism_officer" | "operator"
  department?: string
  permissions: string[]
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface SafetyAlert {
  id: string
  title: string
  message: string
  alertType: "general" | "weather" | "security" | "health" | "traffic"
  severity: "info" | "warning" | "urgent" | "critical"
  targetZones?: string[]
  targetLanguages: string[]
  expiresAt?: string
  createdBy: string
  isActive: boolean
  createdAt: string
}

export interface DashboardStats {
  totalTourists: number
  activeTourists: number
  totalIncidents: number
  openIncidents: number
  averageResponseTime: number
  safetyScore: number
  recentIncidents: Incident[]
  activeAlerts: SafetyAlert[]
}
