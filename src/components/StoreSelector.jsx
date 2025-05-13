import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Store, Loader, AlertCircle, Plus, Clock, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

// The base URL for the API
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'  // Hard-coded for development
  : '/api';  // For production, use relative URL

const StoreSelector = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // State for store request dialog
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestData, setRequestData] = useState({
    name: '',
    description: '',
    requestorName: '',
    requestorEmail: '',
    requestorPhone: '',
    reasonForRequest: '',
  });
  
  // Trigger store fetch on component mount
  useEffect(() => {
    const loadStores = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/stores/mystores`);
        const fetchedStores = response.data;
        
        console.log('StoreSelector: Stores fetched:', fetchedStores);
        setStores(fetchedStores);
        
        if (!fetchedStores || fetchedStores.length === 0) {
          toast({
            title: 'No stores available',
            description: 'You don\'t have any stores assigned to your account.',
            variant: 'destructive',
          });
        } else {
          // Select the first store by default
          setSelectedStore(fetchedStores[0]);
          localStorage.setItem('selectedStoreId', fetchedStores[0]._id);
        }
      } catch (error) {
        console.error('Failed to load stores:', error);
        setError(error.response?.data?.message || 'Could not retrieve store information');
        toast({
          title: 'Error loading stores',
          description: 'Could not retrieve store information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStores();
  }, [toast]);

  // Handle store selection
  const handleStoreChange = (storeId) => {
    console.log('StoreSelector: Selecting store ID:', storeId);
    const selected = stores.find(store => store._id === storeId);
    
    if (selected) {
      setSelectedStore(selected);
      localStorage.setItem('selectedStoreId', selected._id);
      
      toast({
        title: 'Store selected',
        description: `You are now managing "${selected.name}"`,
      });
    } else {
      toast({
        title: 'Error selecting store',
        description: 'Please try again or select another store',
        variant: 'destructive',
      });
    }
  };

  // Handle opening request dialog
  const handleOpenRequestDialog = () => {
    // Pre-fill user information if available
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    setRequestData({
      name: '',
      description: '',
      requestorName: user.name || '',
      requestorEmail: user.email || '',
      requestorPhone: '',
      reasonForRequest: '',
    });
    
    setShowRequestDialog(true);
  };

  // Handle form input change
  const handleRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData({
      ...requestData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmitRequest = async () => {
    // Validate form
    if (!requestData.name || !requestData.requestorName || !requestData.requestorEmail || !requestData.reasonForRequest) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the request object with all fields
      const storeRequest = {
        ...requestData,
        _id: Date.now().toString(), // Generate unique ID
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Submit the request to the API
      const response = await axios.post(`${API_URL}/store-requests`, storeRequest);
      
      // Save to localStorage regardless of API response
      let existingRequests = [];
      try {
        const storedRequests = localStorage.getItem('storeRequests');
        if (storedRequests) {
          existingRequests = JSON.parse(storedRequests);
        }
      } catch (e) {
        console.error('Error parsing stored requests:', e);
      }
      
      // Add the new request to existing ones
      existingRequests.push(storeRequest);
      
      // Save updated list back to localStorage
      localStorage.setItem('storeRequests', JSON.stringify(existingRequests));
      console.log('Store request saved to localStorage:', storeRequest);
      
      setShowRequestDialog(false);
      toast({
        title: 'Request submitted',
        description: 'Your store request has been submitted and is pending approval',
      });
      
      // Reset form
      setRequestData({
        name: '',
        description: '',
        requestorName: '',
        requestorEmail: '',
        requestorPhone: '',
        reasonForRequest: '',
      });
      
    } catch (error) {
      console.error('Error submitting store request:', error);
      
      // Even if API fails, save to localStorage for persistence
      const storeRequest = {
        ...requestData,
        _id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Get existing requests
      let existingRequests = [];
      try {
        const storedRequests = localStorage.getItem('storeRequests');
        if (storedRequests) {
          existingRequests = JSON.parse(storedRequests);
        }
      } catch (e) {
        console.error('Error parsing stored requests:', e);
      }
      
      // Add the new request to existing ones
      existingRequests.push(storeRequest);
      
      // Save updated list back to localStorage
      localStorage.setItem('storeRequests', JSON.stringify(existingRequests));
      console.log('Store request saved to localStorage after API failure:', storeRequest);
      
      setShowRequestDialog(false);
      toast({
        title: 'Request submitted',
        description: 'Your store request has been submitted and is pending approval',
      });
      
      // Reset form
      setRequestData({
        name: '',
        description: '',
        requestorName: '',
        requestorEmail: '',
        requestorPhone: '',
        reasonForRequest: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-lg border-muted">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader className="h-12 w-12 text-emerald-500 animate-spin mb-6" />
            <p className="text-xl font-medium">Loading your stores...</p>
            <p className="text-sm text-muted-foreground mt-3">Please wait while we fetch your store information</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-lg border-red-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-14 w-14 text-red-500" />
            </div>
            <CardTitle className="text-center text-2xl text-red-700">Error Loading Stores</CardTitle>
            <CardDescription className="text-center mt-2 text-base">
              We couldn't load your store information
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4 w-full mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button 
              onClick={() => window.location.reload()}
              className="px-6"
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If no stores are available
  if (!stores || stores.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center mb-4">
              <Store className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-center text-2xl">No Stores Available</CardTitle>
            <CardDescription className="text-center mt-2 text-base">
              You don't have any stores assigned to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center mt-2">
            <p className="text-muted-foreground">
              Need a new store? Request one from the administration.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 justify-center pt-4 pb-6">
            <Button 
              variant="default" 
              className="bg-primary hover:bg-primary/90 px-6 w-full"
              onClick={handleOpenRequestDialog}
            >
              <Clock className="mr-2 h-4 w-4" />
              Request New Store
            </Button>
            <Button 
              variant="outline" 
              className="px-6 w-full"
              onClick={() => navigate('/admin/stores')}
            >
              Go to Store Management
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If user has only one store, just show the store name
  if (stores.length === 1) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center mb-4">
              <Store className="h-16 w-16 text-emerald-500" />
            </div>
            <CardTitle className="text-center text-2xl">Managing Store</CardTitle>
            <CardDescription className="text-center text-xl font-semibold mt-3">
              {stores[0].name}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4">
              <p className="text-emerald-800 text-center">You are currently managing this store</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 justify-center pt-4 pb-6">
            <Button 
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 px-6 w-full"
              onClick={() => navigate('/storeowner')}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="px-6 w-full"
              onClick={handleOpenRequestDialog}
            >
              <Clock className="mr-2 h-4 w-4" />
              Request Additional Store
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Multiple stores, show the selector
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-gray-50 to-blue-50">
      <div className="w-full max-w-4xl">
        <div className="mb-6 md:mb-8 text-center">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Store Selection</h1>
          <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
            Choose a store to manage or request access to a new one
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
                  <Store className="mr-2 h-5 w-5" /> Your Stores
                </h2>
                <p className="text-green-100 text-xs md:text-sm mt-1">
                  Select a store to access its dashboard
                </p>
              </div>
              
              <CardContent className="p-4 md:p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader className="h-8 w-8 text-green-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading your stores...</span>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-red-800">Error Loading Stores</h3>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                ) : stores.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                    <Store className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-amber-800">No Stores Available</h3>
                    <p className="text-amber-700 mt-2 mb-4">
                      You don't have any stores assigned to your account yet.
                    </p>
                    <Button 
                      onClick={handleOpenRequestDialog}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Request New Store
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {stores.map((store) => (
                      <div 
                        key={store._id}
                        className={`rounded-xl transition-all cursor-pointer hover:shadow-md ${
                          selectedStore && selectedStore._id === store._id 
                            ? 'bg-green-50 border-l-4 border-l-green-500 border-y border-r' 
                            : 'bg-white border hover:border-green-300'
                        }`}
                        onClick={() => handleStoreChange(store._id)}
                      >
                        <div className="p-3 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                              selectedStore && selectedStore._id === store._id 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="ml-3 md:ml-4">
                              <h3 className="font-semibold text-base md:text-lg text-gray-900">{store.name}</h3>
                              <p className="text-xs md:text-sm text-gray-500">{store.address?.city || 'Location not available'}{store.address?.state ? `, ${store.address.state}` : ''}</p>
                            </div>
                          </div>
                          <div className="ml-13 sm:ml-0">
                            {selectedStore && selectedStore._id === store._id ? (
                              <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-1" /> Selected
                              </span>
                            ) : (
                              <Button 
                                variant="outline" 
                                className="border-green-500 text-green-600 hover:bg-green-50 w-full sm:w-auto text-xs md:text-sm h-8 md:h-10"
                                onClick={() => handleStoreChange(store._id)}
                              >
                                Select Store
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="bg-gray-50 p-4 md:p-6 flex flex-col sm:flex-row justify-between gap-3 border-t">
                <Button 
                  variant="outline"
                  className="w-full sm:w-auto text-xs md:text-sm h-10 md:h-11"
                  onClick={() => navigate('/select-role')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Role Selection
                </Button>
                
                {selectedStore && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto text-xs md:text-sm h-10 md:h-11"
                    onClick={() => navigate('/storeowner')}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card className="shadow-lg border-0 h-full bg-gradient-to-b from-blue-50 to-white">
              <CardHeader className="pb-2 pt-5 px-4 md:px-6">
                <div className="mx-auto bg-blue-500 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-md">
                  <Plus className="h-7 w-7 md:h-8 md:w-8 text-white" />
                </div>
                <CardTitle className="text-center text-lg md:text-xl">Request Access</CardTitle>
                <CardDescription className="text-center text-sm md:text-base">
                  Need access to a new store?
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center pt-2 px-4 md:px-6">
                <p className="text-gray-600 text-xs md:text-sm mb-5 md:mb-6">
                  Don't see your store? Request access to a new one from the administrator.
                </p>
                <Button 
                  onClick={handleOpenRequestDialog} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-10 md:h-11"
                >
                  Request Store Access
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Having trouble? Contact support at support@agristore.com</p>
        </div>
      </div>
      
      {/* Store Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-lg max-w-[calc(100%-2rem)] p-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
            <DialogTitle className="text-2xl font-bold flex items-center">
              <Plus className="h-5 w-5 mr-2" /> Request New Store
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-1">
              Fill in the details below to request access to a new store
            </DialogDescription>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium">Store Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter store name"
                  value={requestData.name}
                  onChange={handleRequestInputChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-medium">Store Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the store"
                  value={requestData.description}
                  onChange={handleRequestInputChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="requestorName" className="text-sm font-medium">Your Name *</Label>
                <Input
                  id="requestorName"
                  name="requestorName"
                  placeholder="Your full name"
                  value={requestData.requestorName}
                  onChange={handleRequestInputChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="requestorEmail" className="text-sm font-medium">Your Email *</Label>
                <Input
                  id="requestorEmail"
                  name="requestorEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={requestData.requestorEmail}
                  onChange={handleRequestInputChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="requestorPhone" className="text-sm font-medium">Phone Number (Optional)</Label>
                <Input
                  id="requestorPhone"
                  name="requestorPhone"
                  placeholder="Your contact number"
                  value={requestData.requestorPhone}
                  onChange={handleRequestInputChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="reasonForRequest" className="text-sm font-medium">Reason for Request *</Label>
                <Textarea
                  id="reasonForRequest"
                  name="reasonForRequest"
                  placeholder="Why do you need access to this store?"
                  value={requestData.reasonForRequest}
                  onChange={handleRequestInputChange}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[100px]"
                />
              </div>
              
              <div className="md:col-span-2 mt-2">
                <p className="text-sm text-gray-500">Fields marked with * are required</p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end p-6 border-t bg-gray-50">
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setShowRequestDialog(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                disabled={isSubmitting} 
                onClick={handleSubmitRequest}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreSelector; 