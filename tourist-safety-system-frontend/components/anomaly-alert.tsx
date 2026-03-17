"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Brain, MapPin, Clock, User, Phone, CheckCircle, X } from "lucide-react"
import type { AnomalyResult } from "@/lib/ai-anomaly-detection"

interface AnomalyAlertProps {
  anomaly: AnomalyResult
  touristInfo?: {
    name: string
    digitalId: string
    phone: string
    location: string
  }
  onResolve?: (anomalyId: string) => void
  onEscalate?: (anomalyId: string) => void
  onDismiss?: (anomalyId: string) => void
}

export function AnomalyAlert({
  anomaly,
  touristInfo = {
    name: "John Smith",
    digitalId: "TST-2024-ABC123",
    phone: "+1-555-0101",
    location: "Times Square, NY",
  },
  onResolve,
  onEscalate,
  onDismiss,
}: AnomalyAlertProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [actionTaken, setActionTaken] = useState<string | null>(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50"
      case "high":
        return "border-orange-500 bg-orange-50"
      case "medium":
        return "border-yellow-500 bg-yellow-50"
      case "low":
        return "border-blue-500 bg-blue-50"
      default:
        return "border-gray-500 bg-gray-50"
    }
  }

  const getSeverityIcon = (severity: string) => {
    const baseClasses = "h-5 w-5"
    switch (severity) {
      case "critical":
        return <AlertTriangle className={`${baseClasses} text-red-600`} />
      case "high":
        return <AlertTriangle className={`${baseClasses} text-orange-600`} />
      case "medium":
        return <AlertTriangle className={`${baseClasses} text-yellow-600`} />
      case "low":
        return <AlertTriangle className={`${baseClasses} text-blue-600`} />
      default:
        return <AlertTriangle className={`${baseClasses} text-gray-600`} />
    }
  }

  const handleAction = (action: string) => {
    setActionTaken(action)

    switch (action) {
      case "resolve":
        onResolve?.(anomaly.timestamp.toString())
        break
      case "escalate":
        onEscalate?.(anomaly.timestamp.toString())
        break
      case "dismiss":
        onDismiss?.(anomaly.timestamp.toString())
        break
    }
  }

  if (actionTaken) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Action taken: {actionTaken}. Anomaly has been{" "}
          {actionTaken === "resolve" ? "resolved" : actionTaken === "escalate" ? "escalated" : "dismissed"}.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={`${getSeverityColor(anomaly.severity)} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getSeverityIcon(anomaly.severity)}
            <div>
              <CardTitle className="text-lg capitalize">{anomaly.type.replace("_", " ")} Detected</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={
                    anomaly.severity === "critical"
                      ? "bg-red-100 text-red-800"
                      : anomaly.severity === "high"
                        ? "bg-orange-100 text-orange-800"
                        : anomaly.severity === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                  }
                >
                  {anomaly.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline">{(anomaly.confidence * 100).toFixed(1)}% confidence</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "−" : "+"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert Description */}
        <Alert className="border-0 bg-transparent p-0">
          <Brain className="h-4 w-4" />
          <AlertDescription className="ml-6">
            <strong>AI Analysis:</strong> {anomaly.description}
          </AlertDescription>
        </Alert>

        {/* Tourist Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-background/50 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{touristInfo.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono">{touristInfo.digitalId}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{touristInfo.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{touristInfo.location}</span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Detected: {new Date(anomaly.timestamp).toLocaleString()}</span>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold mb-2">Recommended Actions:</h4>
              <ul className="space-y-1">
                {anomaly.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm flex items-start gap-2">
                    <span className="w-1 h-1 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {anomaly.dataPoints.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Data Points:</h4>
                <div className="text-sm text-muted-foreground">
                  {anomaly.dataPoints.length} location points analyzed
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {anomaly.severity === "critical" && (
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleAction("escalate")}
            >
              <Phone className="h-4 w-4 mr-2" />
              Emergency Response
            </Button>
          )}

          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => handleAction("resolve")}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Investigate & Resolve
          </Button>

          <Button size="sm" variant="outline" className="bg-transparent" onClick={() => handleAction("contact")}>
            <Phone className="h-4 w-4 mr-2" />
            Contact Tourist
          </Button>

          <Button size="sm" variant="ghost" onClick={() => handleAction("dismiss")}>
            <X className="h-4 w-4 mr-2" />
            False Positive
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
