// GPS Tracker Service for Live Location Sharing
// Handles background GPS tracking and updates to backend

interface TrackingState {
    isTracking: boolean;
    trackingId: string | null;
    watchId: number | null;
    lastUpdate: Date | null;
}

class GPSTracker {
    private state: TrackingState = {
        isTracking: false,
        trackingId: null,
        watchId: null,
        lastUpdate: null
    };

    private updateInterval: number = 5 * 60 * 1000; // 5 minutes in milliseconds
    private lastSentTime: number = 0;

    // Start GPS tracking
    async startTracking(trackingId: string): Promise<void> {
        if (this.state.isTracking) {
            console.log('Already tracking');
            return;
        }

        if (!navigator.geolocation) {
            throw new Error('Geolocation not supported by your browser');
        }

        this.state.trackingId = trackingId;
        this.state.isTracking = true;

        // Save state to localStorage
        this.saveState();

        // Start continuous GPS watching
        const watchId = navigator.geolocation.watchPosition(
            (position) => this.handlePositionUpdate(position),
            (error) => this.handlePositionError(error),
            {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            }
        );

        this.state.watchId = watchId;
        this.saveState();

        console.log('GPS tracking started:', trackingId);
    }

    // Handle GPS position update
    private async handlePositionUpdate(position: GeolocationPosition): Promise<void> {
        const now = Date.now();

        // Only send update if 5 minutes have passed since last update
        if (now - this.lastSentTime < this.updateInterval) {
            console.log('Skipping update, too soon');
            return;
        }

        const { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = position.coords;

        // Get battery level if available
        let battery: number | null = null;
        if ('getBattery' in navigator) {
            try {
                const batteryInfo: any = await (navigator as any).getBattery();
                battery = Math.round(batteryInfo.level * 100);
            } catch (e) {
                console.log('Battery API not available');
            }
        }

        // Send location update to backend
        try {
            const response = await fetch(`http://localhost:5000/api/tracking/update/${this.state.trackingId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    latitude,
                    longitude,
                    accuracy,
                    speed,
                    heading,
                    altitude,
                    battery
                })
            });

            const result = await response.json();

            if (result.success) {
                this.lastSentTime = now;
                this.state.lastUpdate = new Date();
                this.saveState();
                console.log('Location updated successfully');
            } else {
                console.error('Failed to update location:', result.message);
            }
        } catch (error) {
            console.error('Error updating location:', error);
            // Will retry on next position update
        }
    }

    // Handle GPS errors
    private handlePositionError(error: GeolocationPositionError): void {
        console.error('GPS error:', error);

        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.error('User denied location permission');
                this.stopTracking();
                break;
            case error.POSITION_UNAVAILABLE:
                console.error('Location information unavailable');
                // Don't stop, might recover
                break;
            case error.TIMEOUT:
                console.error('Location request timed out');
                // Don't stop, will retry
                break;
        }
    }

    // Stop GPS tracking
    stopTracking(): void {
        if (this.state.watchId !== null) {
            navigator.geolocation.clearWatch(this.state.watchId);
        }

        this.state.isTracking = false;
        this.state.trackingId = null;
        this.state.watchId = null;
        this.lastSentTime = 0;

        this.saveState();
        console.log('GPS tracking stopped');
    }

    // Check if currently tracking
    isActive(): boolean {
        return this.state.isTracking;
    }

    // Get current tracking ID
    getTrackingId(): string | null {
        return this.state.trackingId;
    }

    // Get last update time
    getLastUpdate(): Date | null {
        return this.state.lastUpdate;
    }

    // Save state to localStorage
    private saveState(): void {
        localStorage.setItem('gpsTrackerState', JSON.stringify({
            isTracking: this.state.isTracking,
            trackingId: this.state.trackingId,
            lastUpdate: this.state.lastUpdate
        }));
    }

    // Load state from localStorage (restore after page reload)
    loadState(): void {
        const saved = localStorage.getItem('gpsTrackerState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.isTracking && parsed.trackingId) {
                    // Resume tracking
                    this.startTracking(parsed.trackingId);
                }
            } catch (e) {
                console.error('Failed to load GPS tracker state');
            }
        }
    }
}

// Export singleton instance
export const gpsTracker = new GPSTracker();
