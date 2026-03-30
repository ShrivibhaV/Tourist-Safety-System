"use client"

import { X, Send, MapPin } from "lucide-react"
import { useState } from "react"
import API_BASE_URL from "@/lib/api"

interface IncidentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IncidentForm({ open, onOpenChange }: IncidentFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [incidentType, setIncidentType] = useState("Other")
  const [severity, setSeverity] = useState("Moderate")
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const incidentTypes = [
    "Theft",
    "Assault",
    "Fraud",
    "Lost Item",
    "Medical Emergency",
    "Accident",
    "Harassment",
    "Suspicious Activity",
    "Other",
  ]

  const severityLevels = ["Minor", "Moderate", "Serious", "Critical"]

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lon: position.coords.longitude })
          alert("Location captured successfully!")
        },
        (error) => alert("Failed to get location: " + error.message)
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  const handleSubmit = async () => {
    if (!title || !description) {
      alert("Please fill in title and description")
      return
    }

    if (!location) {
      const capture = confirm("Location not captured. Capture it now?")
      if (capture) {
        captureLocation()
        return
      }
    }

    setLoading(true)
    try {
      const touristId = localStorage.getItem("touristId")
      if (!touristId) {
        alert("Please login first")
        return
      }

      const incidentData = {
        reportedBy: touristId,
        incidentType,
        title,
        description,
        location: {
          type: "Point",
          coordinates: location ? [location.lon, location.lat] : [0, 0],
        },
        incidentDate: new Date(),
        severity,
        status: "Pending",
      }

      const response = await fetch(`${API_BASE_URL}/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidentData),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitted(true)
        const incidents = JSON.parse(localStorage.getItem("incidents") || "[]")
        incidents.push({
          id: result.data._id,
          title,
          description,
          severity,
          timestamp: new Date().toLocaleString(),
        })
        localStorage.setItem("incidents", JSON.stringify(incidents))

        // Trigger dashboard refresh
        window.dispatchEvent(new Event('refreshDashboard'));

        setTimeout(() => {
          setTitle("")
          setDescription("")
          setIncidentType("Other")
          setSeverity("Moderate")
          setLocation(null)
          setSubmitted(false)
          onOpenChange(false)
        }, 2000)
      } else {
        alert("Failed to submit incident: " + result.message)
      }
    } catch (error) {
      console.error("Error submitting incident:", error)
      alert("Failed to submit incident. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Report Incident</h2>
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">✓</div>
            <p className="text-green-600 font-semibold text-lg">Incident reported successfully!</p>
            <p className="text-gray-600 text-sm mt-2">Authorities have been notified.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Type</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {incidentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Brief incident title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="Describe what happened in detail"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {severityLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <button
                onClick={captureLocation}
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
              >
                <MapPin className="w-4 h-4" />
                {location ? "✓ Location Captured" : "Capture Current Location"}
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : <><Send className="w-4 h-4" /> Submit Report</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
