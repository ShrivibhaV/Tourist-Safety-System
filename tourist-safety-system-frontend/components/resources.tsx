"use client"

import { Phone, Building2, Globe } from "lucide-react"
import { useState } from "react"

interface Helpline {
  name: string
  number: string
  available: string
  description: string
}

interface Embassy {
  country: string
  city: string
  phone: string
  address: string
}

export function Resources() {
  const [activeTab, setActiveTab] = useState<"helplines" | "embassies" | "links">("helplines")
  const [notification, setNotification] = useState<string | null>(null)

  const helplines: Helpline[] = [
    {
      name: "Tourist Helpline",
      number: "1363",
      available: "24/7",
      description: "Official India Tourism Helpline",
    },
    {
      name: "Women Helpline",
      number: "1091",
      available: "24/7",
      description: "Women Safety & Support",
    },
    {
      name: "Cyber Crime Helpline",
      number: "1930",
      available: "24/7",
      description: "Report Cyber Crimes",
    },
    {
      name: "Railway Helpline",
      number: "139",
      available: "24/7",
      description: "Indian Railways Support",
    },
  ]

  const embassies = [
    {
      country: "USA Embassy",
      city: "New Delhi",
      phone: "+91-11-2419-8000",
      address: "Shantipath, Chanakyapuri",
    },
    {
      country: "UK High Commission",
      city: "New Delhi",
      phone: "+91-11-4192-0000",
      address: "Shantipath, Chanakyapuri",
    },
    {
      country: "Australian High Commission",
      city: "New Delhi",
      phone: "+91-11-4139-9999",
      address: "Shantipath, Chanakyapuri",
    },
    {
      country: "Canadian High Commission",
      city: "New Delhi",
      phone: "+91-11-4178-2000",
      address: "Shantipath, Chanakyapuri",
    },
  ]

  const usefulLinks = [
    {
      name: "Incredible India",
      url: "https://www.incredibleindia.org",
      icon: "🇮🇳",
      description: "Official India Tourism",
    },
    {
      name: "Indian Railways",
      url: "https://www.irctc.co.in",
      icon: "🚂",
      description: "Book Train Tickets",
    },
    {
      name: "Ministry of Tourism",
      url: "https://tourism.gov.in",
      icon: "🏛️",
      description: "Government Tourism Info",
    },
    {
      name: "Google Maps",
      url: "https://maps.google.com",
      icon: "🗺️",
      description: "Navigation & Directions",
    },
  ]

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
    setNotification(`Calling ${number}...`)
    setTimeout(() => setNotification(null), 2000)
  }

  const handleOpenLink = (url: string) => {
    window.open(url, "_blank")
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources & Support</h2>

      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab("helplines")}
          className={`px-4 py-3 font-medium text-sm transition-all ${
            activeTab === "helplines"
              ? "text-blue-600 border-b-2 border-blue-600 -mb-2"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Helplines
        </button>
        <button
          onClick={() => setActiveTab("embassies")}
          className={`px-4 py-3 font-medium text-sm transition-all ${
            activeTab === "embassies"
              ? "text-blue-600 border-b-2 border-blue-600 -mb-2"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Embassies
        </button>
        <button
          onClick={() => setActiveTab("links")}
          className={`px-4 py-3 font-medium text-sm transition-all ${
            activeTab === "links"
              ? "text-blue-600 border-b-2 border-blue-600 -mb-2"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Useful Links
        </button>
      </div>

      {/* Helplines Tab */}
      {activeTab === "helplines" && (
        <div className="space-y-3">
          {helplines.map((helpline, index) => (
            <div
              key={index}
              className="bg-linear-to-r from-blue-50 to-blue-100 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{helpline.name}</p>
                  <p className="text-sm text-gray-600">{helpline.description}</p>
                </div>
                <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full">{helpline.available}</span>
              </div>
              <button
                onClick={() => handleCall(helpline.number)}
                className="w-full flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                Call {helpline.number}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Embassies Tab */}
      {activeTab === "embassies" && (
        <div className="space-y-3">
          {embassies.map((embassy, index) => (
            <div
              key={index}
              className="bg-linear-to-r from-purple-50 to-purple-100 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <Building2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{embassy.country}</p>
                  <p className="text-sm text-gray-600">{embassy.address}</p>
                  <p className="text-xs text-gray-500">{embassy.city}</p>
                </div>
              </div>
              <button
                onClick={() => handleCall(embassy.phone)}
                className="w-full flex items-center gap-2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                {embassy.phone}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Useful Links Tab */}
      {activeTab === "links" && (
        <div className="space-y-3">
          {usefulLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => handleOpenLink(link.url)}
              className="w-full bg-linear-to-r from-green-50 to-green-100 rounded-lg p-4 hover:shadow-md transition-all text-left hover:scale-105 transform"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{link.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{link.name}</p>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
                <Globe className="w-5 h-5 text-green-600 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}

      {notification && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-400 rounded-lg text-blue-700 text-center text-sm">
          {notification}
        </div>
      )}
    </div>
  )
}
