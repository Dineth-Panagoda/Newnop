// ========================================
// MAIN APP COMPONENT
// ========================================
// This component sets up routing and global layout

import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Import pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import IssueDetail from './pages/IssueDetail';
import CreateIssue from './pages/CreateIssue';

// Import components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// ========================================
// APP COMPONENT
// ========================================

function App() {
  // Get authentication state from Redux store
  // This tells us if user is logged in
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      {/* Show navbar only if user is authenticated */}
      {isAuthenticated && <Navbar />}

      {/* Define all routes for the application */}
      <Routes>
        {/* ====================================
            PUBLIC ROUTES (No authentication required)
            ==================================== */}

        {/* Login route: If already logged in, redirect to dashboard */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />

        {/* Register route: If already logged in, redirect to dashboard */}
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
        />

        {/* ====================================
            PROTECTED ROUTES (Require authentication)
            ==================================== */}

        {/* Dashboard: Main page showing all issues */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Create Issue: Form to create new issue */}
        <Route
          path="/issues/create"
          element={
            <ProtectedRoute>
              <CreateIssue />
            </ProtectedRoute>
          }
        />

        {/* Issue Detail: View/Edit specific issue */}
        <Route
          path="/issues/:id"
          element={
            <ProtectedRoute>
              <IssueDetail />
            </ProtectedRoute>
          }
        />

        {/* ====================================
            DEFAULT ROUTES
            ==================================== */}

        {/* Root path: Redirect to login or dashboard based on auth status */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />

        {/* Catch all: Redirect to root for any undefined routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
