"use client"

import { AlertTriangle, FileText } from "lucide-react"
import { useState } from "react"
import API_BASE_URL from "@/lib/api"

export function SOSButton() {
  const [sosActive, setSosActive] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSOS = async () => {
    const touristId = localStorage.getItem("touristId")

    if (!touristId) {
      alert("Please login first to send SOS alert")
      return
    }

    if (!window.confirm("Activate SOS? This will notify emergency services with your location.")) {
      return
    }

    setSosActive(true)

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/sos`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tourist: touristId,
                emergencyType: "Threat to Life",
                location: {
                  type: "Point",
                  coordinates: [position.coords.longitude, position.coords.latitude],
                },
                message: "Emergency SOS activated from dashboard",
              }),
            })

            const result = await response.json()

            if (result.success) {
              setShowSuccess(true)
              setTimeout(() => {
                setShowSuccess(false)
                setSosActive(false)
              }, 3000)
            } else {
              alert("Failed to send SOS: " + result.message)
              setSosActive(false)
            }
          } catch (error) {
            console.error("SOS API error:", error)
            alert("Failed to send SOS alert. Please try calling emergency services directly.")
            setSosActive(false)
          }
        },
        (error) => {
          alert(`Unable to get your location: ${error.message}. Enable GPS & try again.`)
          setSosActive(false)
        }
      )
    } else {
      alert("Geolocation not supported. Please call emergency services directly.")
      setSosActive(false)
    }
  }

  const handleViewIncidents = () => {
    window.location.href = "/incidents"
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 relative">
      <div className="relative">
        <div className="absolute inset-0 bg-red-600 rounded-full animate-pulse opacity-75"></div>

        <button
          onClick={handleSOS}
          disabled={sosActive}
          className="relative w-40 h-40 rounded-full bg-linear-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 transition-all flex items-center justify-center shadow-2xl disabled:opacity-50 transform hover:scale-105"
        >
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-white mx-auto mb-2" />
            <span className="text-white font-bold text-2xl">
              {sosActive ? "..." : "SOS"}
            </span>
          </div>
        </button>
      </div>

      {showSuccess && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-700 animate-bounce">
          ✓ SOS Activated! Emergency services notified with your location.
        </div>
      )}

      <p className="text-sm text-gray-600 text-center mt-8 max-w-md">
        Immediately notify authorities and share your live location. Emergency services will be contacted.
      </p>

      <button
        onClick={handleViewIncidents}
        className="mt-8 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        View My Incidents
      </button>
    </div>
  )
}
