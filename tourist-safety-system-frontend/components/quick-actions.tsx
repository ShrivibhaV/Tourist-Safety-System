"use client"

import { Share2, Users, AlertTriangle, MapPin } from "lucide-react"
import { useState } from "react"
import { ContactsModal } from "./modals/contacts-modal"
import { IncidentForm } from "./modals/incident-form"
import { NearbyPlaces } from "./modals/nearby-places"

export function QuickActions() {
  const [showContacts, setShowContacts] = useState(false)
  const [showIncident, setShowIncident] = useState(false)
  const [showNearby, setShowNearby] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  const handleShareLocation = async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setNotification("❌ Geolocation is not supported by your browser");
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setIsLoadingLocation(true);
    setNotification("📍 Getting your location...");

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,  // Use GPS on mobile for better accuracy
          timeout: 10000,             // Wait up to 10 seconds
          maximumAge: 0               // Don't use cached location
        });
      });

      const { latitude, longitude } = position.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const text = `My location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      const fullText = `${text}\n${mapsUrl}`;

      // Try to use Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: "My Location",
            text: fullText,
          });
          setNotification("✅ Location shared successfully!");
          setTimeout(() => setNotification(null), 3000);
        } catch (shareError: any) {
          // User cancelled share or share failed
          if (shareError.name === 'AbortError') {
            setNotification("Share cancelled");
            setTimeout(() => setNotification(null), 2000);
          } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(fullText);
            setNotification("📋 Location copied to clipboard!");
            setTimeout(() => setNotification(null), 3000);
          }
        }
      } else {
        // No share API, use clipboard
        await navigator.clipboard.writeText(fullText);
        setNotification("📋 Location copied to clipboard!");
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error: any) {
      console.error("Error getting location:", error);

      // Provide specific error messages
      if (error.code === 1) {
        setNotification("❌ Location permission denied. Please enable location access in your browser settings.");
      } else if (error.code === 2) {
        setNotification("❌ Location unavailable. Please check your device settings.");
      } else if (error.code === 3) {
        setNotification("❌ Location request timed out. Please try again.");
      } else {
        setNotification("❌ Failed to get location. Please try again.");
      }

      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const actions = [
    {
      label: "Share Location",
      icon: Share2,
      action: handleShareLocation,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "My Contacts",
      icon: Users,
      action: () => setShowContacts(true),
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Report Incident",
      icon: AlertTriangle,
      action: () => setShowIncident(true),
      color: "from-red-500 to-red-600",
    },
    {
      label: "Find Nearby",
      icon: MapPin,
      action: () => setShowNearby(true),
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <>
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon
            const isShareLocation = action.label === "Share Location"
            const isDisabled = isShareLocation && isLoadingLocation

            return (
              <button
                key={index}
                onClick={action.action}
                disabled={isDisabled}
                className={`bg-linear-to-r ${action.color} text-white rounded-xl p-4 hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-3 font-medium ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className={`w-5 h-5 ${isLoadingLocation && isShareLocation ? 'animate-pulse' : ''}`} />
                {isLoadingLocation && isShareLocation ? 'Getting Location...' : action.label}
              </button>
            )
          })}
        </div>
      </div>

      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md">
          {notification}
        </div>
      )}

      <ContactsModal open={showContacts} onOpenChange={setShowContacts} />
      <IncidentForm open={showIncident} onOpenChange={setShowIncident} />
      <NearbyPlaces open={showNearby} onOpenChange={setShowNearby} />
    </>
  )
}
