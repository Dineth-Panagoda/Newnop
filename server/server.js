// ========================================
// IMPORTS AND DEPENDENCIES
// ========================================

// Load environment variables from .env file into process.env
// This must be the first import to ensure env vars are available
require('dotenv').config();

// Express: Web framework for building REST APIs
const express = require('express');

// CORS: Cross-Origin Resource Sharing
// Allows our frontend (running on different port/domain) to make requests to this API
const cors = require('cors');

// Prisma Client: Database ORM for interacting with MySQL
const { PrismaClient } = require('@prisma/client');

// ========================================
// INITIALIZE APP AND DATABASE
// ========================================

const app = express();
const prisma = new PrismaClient(); // Create Prisma client instance

// Port configuration: Use environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

// CORS middleware: Allow requests from frontend
// In production, you should specify allowed origins instead of allowing all (*)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port is 5173
  credentials: true // Allow cookies to be sent with requests
}));

// Body parser middleware: Parse incoming JSON requests
// This allows us to access req.body in our route handlers
app.use(express.json());

// Body parser middleware: Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Logging middleware: Log all incoming requests (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next(); // Pass control to the next middleware
});

// ========================================
// ROUTE IMPORTS
// ========================================

// Import route handlers
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');

// ========================================
// ROUTE REGISTRATION
// ========================================

// Health check endpoint: Used to verify the server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Issue Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route handlers
// All authentication routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// All issue routes will be prefixed with /api/issues
app.use('/api/issues', issueRoutes);

// ========================================
// ERROR HANDLING MIDDLEWARE
// ========================================

// 404 handler: Catch all unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler: Catch any errors from route handlers
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    // Only send stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================================
// SERVER STARTUP
// ========================================

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

// Handle graceful shutdown when the process is terminated
// This ensures database connections are properly closed
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect(); // Close database connection
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect(); // Close database connection
  process.exit(0);
});
