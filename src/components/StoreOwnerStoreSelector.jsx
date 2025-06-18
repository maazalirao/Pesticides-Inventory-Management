import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Building2, Store, MapPin, Mail, Phone, ChevronRight, Users } from 'lucide-react';

const StoreOwnerStoreSelector = () => {
  const navigate = useNavigate();
  const { adminUser, isStoreOwner, isLoading, isAuthenticated } = useAdminAuth();
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [error, setError] = useState(null);

  // Debug logging
  console.log('StoreOwnerStoreSelector - adminUser:', adminUser);
  console.log('StoreOwnerStoreSelector - isAuthenticated:', isAuthenticated);
  console.log('StoreOwnerStoreSelector - isLoading:', isLoading);

  // Get stores assigned to this store owner
  const assignedStores = adminUser?.stores || [];
  console.log('StoreOwnerStoreSelector - assignedStores:', assignedStores);
  
  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your stores...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('StoreOwnerStoreSelector - Not authenticated, redirecting to login');
    navigate('/admin/login');
    return null;
  }

  // If not a store owner, redirect to login
  if (!adminUser) {
    console.log('StoreOwnerStoreSelector - No adminUser found');
    navigate('/admin/login');
    return null;
  }

  useEffect(() => {
    // If store owner has only one store, auto-select it
    if (assignedStores.length === 1) {
      setSelectedStoreId(assignedStores[0]._id);
    }
  }, [assignedStores]);

  const handleStoreSelect = (storeId) => {
    setSelectedStoreId(storeId);
    
    // Store the selected store ID in localStorage for the session
    localStorage.setItem('selectedStoreId', storeId);
    localStorage.setItem('selectedStore', JSON.stringify(
      assignedStores.find(store => store._id === storeId)
    ));
    
    // Navigate to store owner dashboard
    navigate('/storeowner/dashboard');
  };

  // If user is not a store owner, show error
  if (!isStoreOwner()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have store owner permissions.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // If no stores assigned or stores not loaded
  if (adminUser && (!assignedStores || assignedStores.length === 0)) {
    console.log('StoreOwnerStoreSelector - No stores found for user');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-red-600">No Stores Available</CardTitle>
            <CardDescription>
              No stores are assigned to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Account Details:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {adminUser?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {adminUser?.email || 'N/A'}</p>
                <p><strong>Role:</strong> {adminUser?.role || 'N/A'}</p>
                <p><strong>Stores Assigned:</strong> {assignedStores?.length || 0}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Available Store Owner Credentials:</h4>
              <div className="text-sm text-blue-700 space-y-2">
                <div>
                  <strong>Maaz Store:</strong> maaz@pest.com / maaz123
                </div>
                <div>
                  <strong>Jamal Store:</strong> jamal@pest.com / jamal123
                </div>
                <div>
                  <strong>Mudasir Store:</strong> mudasir@pest.com / mudasir123
                </div>
                <div>
                  <strong>Sample Store:</strong> sample@pest.com / sample123
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => {
                  localStorage.removeItem('adminToken');
                  localStorage.removeItem('adminUser');
                  localStorage.removeItem('selectedStoreId');
                  localStorage.removeItem('selectedStore');
                  navigate('/admin/login');
                }} 
                className="w-full"
              >
                Try Different Login
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If only one store, auto-navigate
  if (assignedStores.length === 1 && selectedStoreId) {
    handleStoreSelect(selectedStoreId);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to your store dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Select Your Store
          </h1>
          <p className="text-gray-600">
            Welcome back, {adminUser?.name}! Choose which store you'd like to manage.
          </p>
        </div>

        {/* Store Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignedStores.map((store) => (
            <Card 
              key={store._id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-200"
              onClick={() => handleStoreSelect(store._id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Store className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {store.status || 'Active'}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {store.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {store.description}
                  </p>
                )}
                
                <div className="space-y-2">
                  {store.address?.city && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{store.address.city}, {store.address.state || store.address.country}</span>
                    </div>
                  )}
                  
                  {store.email && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{store.email}</span>
                    </div>
                  )}
                  
                  {store.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStoreSelect(store._id);
                  }}
                >
                  Manage Store
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need access to additional stores? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerStoreSelector; 