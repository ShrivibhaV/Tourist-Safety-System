-- Tourist Safety System Database Schema
-- This script creates the core tables for the tourist safety monitoring system

-- Users table for tourists
CREATE TABLE IF NOT EXISTS tourists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    digital_id VARCHAR(50) UNIQUE NOT NULL,
    blockchain_hash VARCHAR(256) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    nationality VARCHAR(100),
    passport_number VARCHAR(50),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'en',
    safety_score INTEGER DEFAULT 100,
    current_location JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geofencing zones for safety monitoring
CREATE TABLE IF NOT EXISTS safety_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    zone_type VARCHAR(50) NOT NULL, -- 'safe', 'caution', 'restricted', 'emergency'
    coordinates JSONB NOT NULL, -- GeoJSON polygon
    risk_level INTEGER DEFAULT 1, -- 1-5 scale
    active_hours JSONB, -- Time ranges when zone is active
    created_by UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidents and emergency reports
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID REFERENCES tourists(id),
    incident_type VARCHAR(100) NOT NULL, -- 'emergency', 'medical', 'theft', 'harassment', 'lost'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(50) DEFAULT 'reported', -- 'reported', 'investigating', 'resolved', 'closed'
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location JSONB NOT NULL, -- lat, lng, address
    media_urls JSONB, -- Array of image/video URLs
    assigned_officer_id UUID,
    response_time_minutes INTEGER,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time location tracking for safety monitoring
CREATE TABLE IF NOT EXISTS location_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID REFERENCES tourists(id),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    accuracy DECIMAL(5, 2),
    zone_id UUID REFERENCES safety_zones(id),
    is_safe_zone BOOLEAN DEFAULT true,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI anomaly detection logs
CREATE TABLE IF NOT EXISTS anomaly_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID REFERENCES tourists(id),
    anomaly_type VARCHAR(100) NOT NULL, -- 'unusual_movement', 'panic_pattern', 'zone_violation'
    confidence_score DECIMAL(3, 2) NOT NULL, -- 0.00 to 1.00
    data_points JSONB NOT NULL, -- Raw data that triggered the anomaly
    location JSONB,
    auto_resolved BOOLEAN DEFAULT false,
    reviewed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System administrators and officers
CREATE TABLE IF NOT EXISTS system_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'police_officer', 'tourism_officer', 'operator'
    department VARCHAR(100),
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety tips and alerts
CREATE TABLE IF NOT EXISTS safety_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'general', 'weather', 'security', 'health', 'traffic'
    severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'urgent', 'critical'
    target_zones JSONB, -- Array of zone IDs, null for global
    target_languages JSONB DEFAULT '["en"]',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES system_users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tourists_digital_id ON tourists(digital_id);
CREATE INDEX IF NOT EXISTS idx_tourists_email ON tourists(email);
CREATE INDEX IF NOT EXISTS idx_incidents_tourist_id ON incidents(tourist_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_location_history_tourist_id ON location_history(tourist_id);
CREATE INDEX IF NOT EXISTS idx_location_history_timestamp ON location_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_anomaly_detections_tourist_id ON anomaly_detections(tourist_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_active ON safety_alerts(is_active, expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_tourists_updated_at BEFORE UPDATE ON tourists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safety_zones_updated_at BEFORE UPDATE ON safety_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_users_updated_at BEFORE UPDATE ON system_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
