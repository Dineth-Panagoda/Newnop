// ========================================
// VITE CONFIGURATION
// ========================================
// Vite is a modern build tool that provides fast development server and optimized production builds

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Plugins: Add React support with Fast Refresh (hot module replacement)
  plugins: [react()],

  // Development server configuration
  server: {
    port: 5173, // Port for development server (Vite default)
    proxy: {
      // Proxy API requests to backend server
      // This avoids CORS issues during development
      // Any request to /api will be forwarded to http://localhost:5000
      '/api': {
        target: 'http://localhost:5001', // Backend server URL
        changeOrigin: true, // Needed for virtual hosted sites
        secure: false // Allow self-signed certificates
      }
    }
  },

  // Build configuration
  build: {
    outDir: 'dist', // Output directory for production build
    sourcemap: false, // Disable source maps in production for smaller bundle size
    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 1000
  }
});
