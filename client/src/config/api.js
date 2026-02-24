// ========================================
// API CONFIGURATION
// ========================================
// Manages API URL for different environments (development vs production)

/**
 * API_URL determines the backend server URL
 * - In development: Uses '/api' which is proxied to localhost:5001 by Vite
 * - In production: Uses VITE_API_URL environment variable set in Vercel
 */
export const API_URL = import.meta.env.VITE_API_URL || '/api';
