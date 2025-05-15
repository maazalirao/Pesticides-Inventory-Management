import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ redirectPath = '/admin-login' }) => {
  const { isAuthenticated, loading } = useAuth();

  // If authentication is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 