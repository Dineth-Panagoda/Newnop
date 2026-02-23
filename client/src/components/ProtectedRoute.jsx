// ========================================
// PROTECTED ROUTE COMPONENT
// ========================================
// Wrapper component that protects routes requiring authentication
// Redirects to login if user is not authenticated

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute component
 *
 * This component checks if the user is authenticated before rendering children
 * If not authenticated, it redirects to the login page
 *
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @param {ReactNode} children - Components to render if authenticated
 */
const ProtectedRoute = ({ children }) => {
  // Get authentication status from Redux store
  const { isAuthenticated } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child components
  return children;
};

export default ProtectedRoute;
