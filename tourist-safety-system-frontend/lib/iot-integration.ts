// IoT Integration for Smart Tourist Safety System
export interface IoTDevice {
  id: string
  type: "camera" | "sensor" | "beacon" | "emergency_button"
  location: {
    lat: number
    lng: number
    zone_id: string
  }
  status: "active" | "inactive" | "maintenance"
  last_ping: Date
  data: any
}

export interface IoTSensorData {
  device_id: string
  timestamp: Date
  crowd_density?: number
  noise_level?: number
  temperature?: number
  air_quality?: number
  motion_detected?: boolean
  emergency_triggered?: boolean
}

export class IoTManager {
  private devices: Map<string, IoTDevice> = new Map()
  private websocket: WebSocket | null = null

  constructor() {
    this.initializeWebSocket()
  }

  private initializeWebSocket() {
    // In a real implementation, this would connect to your IoT platform
    this.websocket = new WebSocket("wss://iot-gateway.example.com")

    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.handleIoTData(data)
    }
  }

  private handleIoTData(data: IoTSensorData) {
    // Process incoming IoT sensor data
    if (data.emergency_triggered) {
      this.triggerEmergencyAlert(data)
    }

    if (data.crowd_density && data.crowd_density > 0.8) {
      this.handleCrowdingAlert(data)
    }
  }

  private triggerEmergencyAlert(data: IoTSensorData) {
    // Trigger emergency response
    console.log("[IoT] Emergency triggered by device:", data.device_id)
  }

  private handleCrowdingAlert(data: IoTSensorData) {
    // Handle crowd density alerts
    console.log("[IoT] High crowd density detected:", data.crowd_density)
  }

  public registerDevice(device: IoTDevice) {
    this.devices.set(device.id, device)
  }

  public getDeviceStatus(deviceId: string): IoTDevice | undefined {
    return this.devices.get(deviceId)
  }

  public getAllDevices(): IoTDevice[] {
    return Array.from(this.devices.values())
  }
}

export const iotManager = new IoTManager()
