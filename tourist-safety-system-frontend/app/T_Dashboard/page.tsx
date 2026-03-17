"use client";

import { Header } from "@/components/header";
import { StatsCards } from "@/components/stats-cards";
import { QuickActions } from "@/components/quick-actions";
import { SOSButton } from "@/components/sos-button";
import { EmergencyServices } from "@/components/emergency-services";
import { Resources } from "@/components/resources";
import { SafetyTips } from "@/components/safety-tips";
import { TrackingControls } from "@/components/tracking-controls";
import { LocationSharingDialog } from "@/components/modals/location-sharing-dialog";
import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { gpsTracker } from "@/services/gps-tracker";

export default function Home() {
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [hasActiveTracking, setHasActiveTracking] = useState(false);

  useEffect(() => {
    checkActiveTracking();
  }, []);

  const checkActiveTracking = async () => {
    const touristId = localStorage.getItem("touristId");
    if (!touristId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tracking/active/${touristId}`);
      const result = await response.json();
      setHasActiveTracking(result.hasActiveTracking);
    } catch (error) {
      console.error("Failed to check tracking status:", error);
    }
  };

  const handleEnableTracking = async (duration: number) => {
    const touristId = localStorage.getItem("touristId");
    if (!touristId) return;

    try {
      // Get emergency contact from backend
      const dashResponse = await fetch(`http://localhost:5000/api/dashboard/${touristId}`);
      const dashResult = await dashResponse.json();

      console.log('🔍 Dashboard data:', dashResult);

      if (dashResult.success && dashResult.data.emergencyContacts && dashResult.data.emergencyContacts.length > 0) {
        const contact = dashResult.data.emergencyContacts[0];

        console.log('🔍 Emergency contact:', contact);

        // IMPORTANT: Try different possible field names for phone
        const phoneNumber = contact.phone || contact.phoneNumber || contact.contactNumber || contact.number;

        if (!phoneNumber) {
          alert('Emergency contact phone number not found in your profile. Please add emergency contact details.');
          return;
        }

        const trackingData = {
          touristId,
          duration,
          emergencyContactName: contact.name,
          emergencyContactPhone: phoneNumber
        };

        console.log('🔍 Sending tracking data:', trackingData);

        // Get user's CURRENT GPS location first
        const getCurrentLocation = (): Promise<GeolocationPosition> => {
          return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });
        };

        let currentPosition;
        try {
          currentPosition = await getCurrentLocation();
        } catch (error) {
          alert('Please allow GPS access to share your live location.');
          return;
        }

        // Start tracking session with actual coordinates
        const trackResponse = await fetch('http://localhost:5000/api/tracking/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(trackingData)
        });

        const trackResult = await trackResponse.json();

        if (trackResult.success) {
          // Send FIRST location update immediately with actual GPS
          await fetch(`http://localhost:5000/api/tracking/update/${trackResult.data.trackingId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: currentPosition.coords.latitude,
              longitude: currentPosition.coords.longitude,
              accuracy: currentPosition.coords.accuracy
            })
          });

          // Start GPS tracking for future updates
          await gpsTracker.startTracking(trackResult.data.trackingId);

          // Open WhatsApp with clickable link
          const trackingUrl = trackResult.data.trackingUrl;
          // WhatsApp-friendly format - link must be on its own line with space before/after for clickability
          const message = `🛡️ *Tourist Safety System*\n\nI'm sharing my live location with you!\n\n📍 Click here to track me:\n\n${trackingUrl}\n\n⏰ Expires: ${new Date(trackResult.data.expiresAt).toLocaleString()}\n\nYou can see my real-time location on the map.`;
          const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

          // Try to open WhatsApp
          const newWindow = window.open(whatsappUrl, '_blank');

          // Notify user if popup might have been blocked
          if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            alert("Tracking started! If WhatsApp didn't open, please click the 'Share Link' button in the dashboard.");
          }

          // Close dialog and update state WITHOUT reloading
          setShowLocationDialog(false);
          setHasActiveTracking(true);
          // Trigger a refresh of the tracking controls by dispatching a custom event or just letting the state update propagate
          // Since TrackingControls polls, it will pick it up, but we can also force a check if we passed a callback.
          // For now, the state update + polling in TrackingControls (every 60s) might be too slow.
          // Let's force a reload of the component by unmounting/remounting or just rely on the user seeing the "Tracking Active" state.
          // Actually, TrackingControls has its own internal state. We should probably trigger it to update.
          // A simple way is to reload, but that kills the flow. 
          // Let's stick to state update and maybe trigger a re-fetch in TrackingControls if possible.
          // Given the architecture, a reload is the simplest way to ensure everything syncs up, BUT it kills the window.open.
          // So we will NOT reload, but we need TrackingControls to know.
          // We can use a window event.
          window.dispatchEvent(new Event('tracking-started'));
        } else {
          alert('Failed to start tracking: ' + trackResult.message);
        }
      } else {
        alert('No emergency contact found. Please add one in your profile first.');
      }
    } catch (error) {
      console.error('Tracking start error:', error);
      alert('Failed to start location sharing');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header />

        {/* Live Location Sharing Button - Only show if no active tracking */}
        {!hasActiveTracking && (
          <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-purple-600 p-3 rounded-full">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Live Location Tracking</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Share your real-time location with your emergency contact. They can track you on a live map.
                </p>
                <button
                  onClick={() => setShowLocationDialog(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-105"
                >
                  <MapPin className="w-5 h-5" />
                  Enable Live Tracking
                </button>
              </div>
            </div>
          </div>
        )}

        <TrackingControls />
        <StatsCards />
        <QuickActions />
        <SOSButton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <div className="lg:col-span-2">
            <EmergencyServices />
          </div>
          <div>
            <Resources />
          </div>
        </div>

        <SafetyTips />
      </div>

      {/* Location Sharing Dialog */}
      <LocationSharingDialog
        open={showLocationDialog}
        onOpenChange={setShowLocationDialog}
        onEnable={handleEnableTracking}
      />
    </main>
  );
}
