'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LocationSharingDialog } from '@/components/modals/location-sharing-dialog';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/tourists/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Store user data
        localStorage.setItem('touristId', result.data.id);
        localStorage.setItem('touristName', result.data.name);
        localStorage.setItem('touristEmail', result.data.email);
        localStorage.setItem('isLoggedIn', 'true');

        // Show location sharing dialog
        console.log('🔍 DEBUG: Setting showLocationDialog to true');
        setShowLocationDialog(true);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-green-50 to-teal-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tourist Safety System
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="your@email.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Test Credentials */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            Test Credentials:
          </p>
          <p className="text-sm text-amber-700">
            Email: test@tourist.com<br />
            Password: Test@1234
          </p>
          <p className="text-xs text-amber-600 mt-2">
            (Created by initDB.js script)
          </p>
        </div>
      </div>

      {/* Location Sharing Dialog */}
      <LocationSharingDialog
        open={showLocationDialog}
        onOpenChange={(open) => {
          setShowLocationDialog(open);
          if (!open) {
            // User declined or closed - go to dashboard anyway
            router.push('/T_Dashboard');
          }
        }}
        onEnable={async (duration) => {
          const touristId = localStorage.getItem('touristId');
          if (!touristId) return;

          try {
            // Get emergency contact from backend
            const dashResponse = await fetch(`http://localhost:5000/api/dashboard/${touristId}`);
            const dashResult = await dashResponse.json();

            if (dashResult.success && dashResult.data.emergencyContacts && dashResult.data.emergencyContacts.length > 0) {
              const contact = dashResult.data.emergencyContacts[0];

              // Start tracking session
              const trackResponse = await fetch('http://localhost:5000/api/tracking/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  touristId,
                  duration,
                  emergencyContactName: contact.name,
                  emergencyContactPhone: contact.phoneNumber
                })
              });

              const trackResult = await trackResponse.json();

              if (trackResult.success) {
                // Start GPS tracking
                const { gpsTracker } = await import('@/services/gps-tracker');
                await gpsTracker.startTracking(trackResult.data.trackingId);

                // Open WhatsApp to share link
                const message = `🛡️ Tourist Safety System\n\nI'm sharing my live location with you.\n\n📍 Track me at: ${trackResult.data.trackingUrl}\n\n⏰ Expires: ${new Date(trackResult.data.expiresAt).toLocaleString()}`;
                const whatsappUrl = `https://wa.me/${contact.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');

                // Close dialog and go to dashboard
                setShowLocationDialog(false);
                router.push('/T_Dashboard');
              } else {
                alert('Failed to start tracking: ' + trackResult.message);
              }
            }
          } catch (error) {
            console.error('Tracking start error:', error);
            alert('Failed to start location sharing');
          }
        }}
      />
    </div>
  );
}