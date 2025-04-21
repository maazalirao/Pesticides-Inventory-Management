import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '@clerk/clerk-react';

const ProtectedRoute = ({ children, requiredRole = 'customer' }) => {
  const { hasRole, loading } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (!hasRole(requiredRole)) {
    // Redirect unauthorized users to homepage
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Render the protected content if user has required role
  return children;
};

export default ProtectedRoute; 