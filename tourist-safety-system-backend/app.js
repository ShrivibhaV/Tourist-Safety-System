// app.js - Express application setup
import express from "express";
import cors from "cors";

// Route Files
import touristRegistrationRoutes from "./routes/tourist_rester.routes.js";
import touristProfileRoutes from "./routes/tourist_profile.routes.js";
import touristFeedbackRoutes from "./routes/tourist_feedback.routes.js";
import dashboardRoutes from "./routes/tourist_dashboard.routes.js";
import trackingRoutes from "./routes/tracking.routes.js";
import securityDashboardRoutes from "./routes/security_dashboard.routes.js";

const app = express();

// -----------------------------
// 🔒 ENABLE CORS (MUST BE FIRST!)
// -----------------------------
app.use(cors({
  origin: true, // Allow any origin (for development)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// -----------------------------
// 📦 MIDDLEWARE
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// 📌 ROUTES
// -----------------------------

// Health check (test if server is working)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    cors: 'enabled'
  });
});

// Dashboard routes (LOGIN, PROFILE, DASHBOARD data)
app.use("/api", dashboardRoutes);

// Live location tracking routes
app.use("/api/tracking", trackingRoutes);

// Security/Police dashboard routes
app.use("/api/security", securityDashboardRoutes);

// Your existing routes
app.use("/api/tourists", touristRegistrationRoutes);
app.use("/api/profiles", touristProfileRoutes);
app.use("/api/feedbacks", touristFeedbackRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.url} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

export default app;