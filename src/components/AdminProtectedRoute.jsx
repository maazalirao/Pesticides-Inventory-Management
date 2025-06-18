import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Loader } from './ui/loader';
import { ShieldCheck } from 'lucide-react';

/**
 * AdminProtectedRoute - Protects admin routes with authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authenticated
 * @param {Array<string>} props.requiredRoles - Array of required roles (optional)
 * @param {string} props.storeId - Required store ID for store-specific access (optional)
 */
const AdminProtectedRoute = ({ 
  children, 
  requiredRoles = ['admin', 'store_owner'], 
  storeId = null 
}) => {
  const { isAuthenticated, isLoading, adminUser, hasStoreAccess } = useAdminAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to unified login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = requiredRoles.includes(adminUser?.role);
  if (!hasRequiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have the required permissions to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required role: {requiredRoles.join(' or ')}
          </p>
          <p className="text-sm text-gray-500">
            Your role: {adminUser?.role}
          </p>
        </div>
      </div>
    );
  }

  // Check store access if storeId is provided
  if (storeId && !hasStoreAccess(storeId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have access to this specific store.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated and has proper permissions
  return <>{children}</>;
};

export default AdminProtectedRoute; 