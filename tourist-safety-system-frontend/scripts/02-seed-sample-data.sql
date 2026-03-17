-- Sample data for Tourist Safety System
-- This script populates the database with initial test data

-- Insert sample safety zones
INSERT INTO safety_zones (name, description, zone_type, coordinates, risk_level) VALUES
('City Center Safe Zone', 'Main tourist area with high security presence', 'safe', 
 '{"type":"Polygon","coordinates":[[[-74.0059,40.7128],[-74.0059,40.7228],[-73.9959,40.7228],[-73.9959,40.7128],[-74.0059,40.7128]]]}', 1),
('Airport Security Zone', 'International airport perimeter', 'safe',
 '{"type":"Polygon","coordinates":[[[-73.7781,40.6413],[-73.7781,40.6513],[-73.7681,40.6513],[-73.7681,40.6413],[-73.7781,40.6413]]]}', 1),
('Construction Area', 'Active construction zone - exercise caution', 'caution',
 '{"type":"Polygon","coordinates":[[[-74.0159,40.7328],[-74.0159,40.7428],[-74.0059,40.7428],[-74.0059,40.7328],[-74.0159,40.7328]]]}', 3),
('Restricted Military Zone', 'No civilian access permitted', 'restricted',
 '{"type":"Polygon","coordinates":[[[-74.0259,40.7528],[-74.0259,40.7628],[-74.0159,40.7628],[-74.0159,40.7528],[-74.0259,40.7528]]]}', 5);

-- Insert sample system users
INSERT INTO system_users (username, email, password_hash, role, department, permissions) VALUES
('admin', 'admin@tourism.gov', '$2b$10$example_hash_admin', 'admin', 'Tourism Department', 
 '["view_all", "manage_users", "manage_zones", "view_analytics"]'),
('officer_smith', 'smith@police.gov', '$2b$10$example_hash_smith', 'police_officer', 'Metropolitan Police',
 '["view_incidents", "respond_incidents", "update_incidents"]'),
('tourism_manager', 'manager@tourism.gov', '$2b$10$example_hash_manager', 'tourism_officer', 'Tourism Department',
 '["view_tourists", "manage_alerts", "view_analytics"]');

-- Insert sample safety alerts
INSERT INTO safety_alerts (title, message, alert_type, severity, target_languages, created_by) VALUES
('Weather Advisory', 'Heavy rainfall expected in the next 2 hours. Seek indoor shelter if outdoors.', 'weather', 'warning', 
 '["en", "es", "fr"]', (SELECT id FROM system_users WHERE username = 'tourism_manager')),
('Traffic Disruption', 'Major road closure on Main Street due to parade. Use alternative routes.', 'traffic', 'info',
 '["en", "es", "fr"]', (SELECT id FROM system_users WHERE username = 'tourism_manager')),
('Security Alert', 'Increased security measures in downtown area. Carry identification at all times.', 'security', 'warning',
 '["en", "es", "fr", "de", "zh"]', (SELECT id FROM system_users WHERE username = 'admin'));

-- Insert sample tourists (for testing purposes)
INSERT INTO tourists (digital_id, first_name, last_name, email, phone, nationality, passport_number, emergency_contact_name, emergency_contact_phone, preferred_language) VALUES
('TST-2024-001', 'John', 'Smith', 'john.smith@email.com', '+1-555-0101', 'USA', 'US123456789', 'Jane Smith', '+1-555-0102', 'en'),
('TST-2024-002', 'Maria', 'Garcia', 'maria.garcia@email.com', '+34-600-123456', 'Spain', 'ES987654321', 'Carlos Garcia', '+34-600-123457', 'es'),
('TST-2024-003', 'Hans', 'Mueller', 'hans.mueller@email.com', '+49-170-1234567', 'Germany', 'DE456789123', 'Anna Mueller', '+49-170-1234568', 'de');

-- Insert sample location history
INSERT INTO location_history (tourist_id, latitude, longitude, accuracy, zone_id, is_safe_zone) VALUES
((SELECT id FROM tourists WHERE digital_id = 'TST-2024-001'), 40.7128, -74.0059, 5.0, 
 (SELECT id FROM safety_zones WHERE name = 'City Center Safe Zone'), true),
((SELECT id FROM tourists WHERE digital_id = 'TST-2024-002'), 40.6413, -73.7781, 3.0,
 (SELECT id FROM safety_zones WHERE name = 'Airport Security Zone'), true),
((SELECT id FROM tourists WHERE digital_id = 'TST-2024-003'), 40.7328, -74.0159, 8.0,
 (SELECT id FROM safety_zones WHERE name = 'Construction Area'), false);
