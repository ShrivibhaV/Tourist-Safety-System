"use client"

import { X, Send } from "lucide-react"
import { useState } from "react"

interface IncidentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IncidentForm({ open, onOpenChange }: IncidentFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("medium")
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // ---------- Fetch Location ----------
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        })
      },
      () => alert("Could not fetch your location"),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (!title || !description) return alert("Fill all fields")

    setLoading(true)

    const incident = {
      id: Date.now().toString(),
      title,
      description,
      severity,
      location,
      timestamp: new Date().toISOString(),
      imageName: image ? image.name : null
    }

    // ---- Save locally (offline) ----
    const old = JSON.parse(localStorage.getItem("incidents") || "[]")
    old.push(incident)
    localStorage.setItem("incidents", JSON.stringify(old))

    // ---- Prepare to send to backend ----
    const formData = new FormData()
    formData.append("incident", JSON.stringify(incident))
    if (image) formData.append("image", image)

    try {
      await fetch("/api/incidents", {
        method: "POST",
        body: formData,
      })
    } catch (err) {
      console.error("Failed to send to server:", err)
    }

    // Show success
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setTitle("")
      setDescription("")
      setSeverity("medium")
      setLocation(null)
      setImage(null)
      onOpenChange(false)
      setLoading(false)
    }, 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold">Report Incident</h2>
          <button onClick={() => onOpenChange(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {submitted ? (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">✓</div>
            <p className="text-green-600 font-semibold">Incident reported successfully!</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">

            {/* Title */}
            <input
              type="text"
              placeholder="Incident title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />

            {/* Description */}
            <textarea
              placeholder="Describe what happened"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows={4}
            />

            {/* Severity */}
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="high">High Severity</option>
            </select>

            {/* Location */}
            <button
              onClick={getLocation}
              className="w-full bg-gray-100 border py-2 rounded-lg"
            >
              {location ? "Location Captured ✓" : "Get Current Location"}
            </button>

            {location && (
              <a
                href={`https://www.google.com/maps?q=${location.lat},${location.lon}`}
                target="_blank"
                className="text-blue-600 underline block"
              >
                View on Google Maps
              </a>
            )}

            {/* Image Upload */}
            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full mt-2"
            />
            {image && <p className="text-sm text-gray-600">Selected: {image.name}</p>}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
