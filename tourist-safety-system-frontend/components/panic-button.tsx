"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Phone, AlertTriangle, CheckCircle, X } from "lucide-react"

interface PanicButtonProps {
  onEmergencyTriggered?: () => void
}

export function PanicButton({ onEmergencyTriggered }: PanicButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isEmergencyActive, setIsEmergencyActive] = useState(false)
  const [emergencyId, setEmergencyId] = useState<string | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPressed && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            triggerEmergency()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPressed, countdown])

  const handlePressStart = () => {
    setIsPressed(true)
    setCountdown(3)
  }

  const handlePressEnd = () => {
    setIsPressed(false)
    setCountdown(0)
  }

  const triggerEmergency = () => {
    setIsPressed(false)
    setCountdown(0)
    setIsEmergencyActive(true)

    // Generate emergency ID
    const id = `EMG-${Date.now()}`
    setEmergencyId(id)

    // Call parent callback
    onEmergencyTriggered?.()

    // Auto-dismiss after 10 seconds for demo
    setTimeout(() => {
      setIsEmergencyActive(false)
      setEmergencyId(null)
    }, 10000)
  }

  const cancelEmergency = () => {
    setIsEmergencyActive(false)
    setEmergencyId(null)
  }

  if (isEmergencyActive) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6">
          <Alert className="border-red-500 bg-red-100 mb-4">
            <CheckCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Emergency Alert Sent!</strong>
              <br />
              Emergency ID: {emergencyId}
              <br />
              Help is on the way. Stay calm and follow safety instructions.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-3">
                <Phone className="h-8 w-8 text-red-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-red-800">Emergency Services Contacted</h3>
              <p className="text-sm text-red-600">Response team dispatched to your location</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" className="border-red-300 text-red-700 bg-transparent">
                <Phone className="h-4 w-4 mr-2" />
                Call Emergency Services Directly
              </Button>
              <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={cancelEmergency}>
                <X className="h-4 w-4 mr-2" />
                Cancel Alert (False Alarm)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-red-50 border-red-200">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Emergency Assistance</h3>
          </div>

          <p className="text-sm text-red-600 mb-4">
            Press and hold for 3 seconds to alert emergency services and your emergency contact
          </p>

          <div className="relative">
            <Button
              size="lg"
              className={`w-32 h-32 rounded-full text-white font-bold text-lg transition-all duration-200 ${
                isPressed ? "bg-red-700 scale-110 shadow-lg" : "bg-red-600 hover:bg-red-700"
              }`}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
            >
              {isPressed ? (
                <div className="flex flex-col items-center">
                  <Phone className="h-8 w-8 mb-1" />
                  <span className="text-2xl font-bold">{countdown}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Phone className="h-8 w-8 mb-1" />
                  <span>EMERGENCY</span>
                </div>
              )}
            </Button>

            {isPressed && <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>}
          </div>

          <div className="text-xs text-red-500 space-y-1">
            <p>• Sends GPS location to emergency services</p>
            <p>• Notifies your emergency contact</p>
            <p>• Records incident for safety monitoring</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
