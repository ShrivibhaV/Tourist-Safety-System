"use client"

import { Phone } from "lucide-react"
import { useState } from "react"

export function EmergencyServices() {
  const [calling, setCalling] = useState<string | null>(null)
  const [notification, setNotification] = useState<string | null>(null)

  const handleEmergencyCall = (service: string, number: string) => {
    setCalling(service)
    setNotification(`Calling ${service}...`)

    // Trigger actual phone call
    window.location.href = `tel:${number}`

    setTimeout(() => {
      setCalling(null)
      setNotification(null)
    }, 2000)
  }

  const services = [
    {
      name: "Police",
      number: "100",
      color: "from-blue-500 to-blue-600",
      icon: "🚔",
      description: "Emergency Police Services",
    },
    {
      name: "Ambulance",
      number: "102",
      color: "from-red-500 to-red-600",
      icon: "🚑",
      description: "Medical Emergency",
    },
    {
      name: "Fire",
      number: "101",
      color: "from-orange-500 to-orange-600",
      icon: "🚒",
      description: "Fire Emergency",
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Emergency Services in India</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`bg-linear-to-br ${service.color} w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-4 shadow-lg transform hover:scale-110 transition-transform`}
            >
              {service.icon}
            </div>
            <p className="font-semibold text-gray-900 mb-1">{service.name}</p>
            <p className="text-xs text-gray-500 mb-4">{service.description}</p>
            <button
              onClick={() => handleEmergencyCall(service.name, service.number)}
              disabled={calling !== null}
              className={`w-full bg-linear-to-r ${service.color} hover:shadow-lg text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              <Phone className="w-5 h-5" />
              {calling === service.name ? "Calling..." : `Call ${service.number}`}
            </button>
          </div>
        ))}
      </div>

      {notification && (
        <div className="mt-6 p-4 bg-blue-100 border border-blue-400 rounded-lg text-blue-700 text-center">
          {notification}
        </div>
      )}
    </div>
  )
}
