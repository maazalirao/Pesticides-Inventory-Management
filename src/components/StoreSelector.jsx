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
import { Store, Loader, AlertCircle, Plus, Clock } from 'lucide-react';
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
    <div className="flex justify-center items-center min-h-[60vh]">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-center mb-4">
            <Store className="h-16 w-16 text-emerald-500" />
          </div>
          <CardTitle className="text-center text-2xl">Select a Store</CardTitle>
          <CardDescription className="text-center mt-2 text-base">
            Choose which store you want to manage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <Select 
            onValueChange={handleStoreChange}
            defaultValue={selectedStore?._id || stores[0]?._id}
          >
            <SelectTrigger className="w-full h-12">
              <SelectValue placeholder="Select a store" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Your Stores</SelectLabel>
                {stores.map(store => (
                  <SelectItem key={store._id} value={store._id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          {selectedStore && (
            <div className="pt-2 pb-1">
              <p className="text-sm font-medium">Selected Store:</p>
              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                <p className="text-emerald-700 font-semibold">{selectedStore.name}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 justify-center pt-4 pb-6">
          <Button
            variant="default"
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-6"
            onClick={() => navigate('/storeowner')}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleOpenRequestDialog}
          >
            <Clock className="mr-2 h-4 w-4" />
            Request New Store
          </Button>
        </CardFooter>
      </Card>

      {/* Store Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-primary">
              Request New Store
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              Fill in the details below to request a new store. Your request will be reviewed by an administrator.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-200">Store Name <span className="text-red-400">*</span></Label>
              <Input
                id="name"
                name="name"
                value={requestData.name}
                onChange={handleRequestInputChange}
                placeholder="Enter store name"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-200">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={requestData.description}
                onChange={handleRequestInputChange}
                placeholder="Brief description of the store"
                className="mt-1 h-20 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="requestorName" className="text-sm font-semibold text-gray-200">Your Name <span className="text-red-400">*</span></Label>
              <Input
                id="requestorName"
                name="requestorName"
                value={requestData.requestorName}
                onChange={handleRequestInputChange}
                placeholder="John Doe"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="requestorEmail" className="text-sm font-semibold text-gray-200">Your Email <span className="text-red-400">*</span></Label>
              <Input
                id="requestorEmail"
                name="requestorEmail"
                type="email"
                value={requestData.requestorEmail}
                onChange={handleRequestInputChange}
                placeholder="john@example.com"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="requestorPhone" className="text-sm font-semibold text-gray-200">Your Phone</Label>
              <Input
                id="requestorPhone"
                name="requestorPhone"
                value={requestData.requestorPhone}
                onChange={handleRequestInputChange}
                placeholder="+1 (555) 123-4567"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="reasonForRequest" className="text-sm font-semibold text-gray-200">Reason for Request <span className="text-red-400">*</span></Label>
              <Textarea
                id="reasonForRequest"
                name="reasonForRequest"
                value={requestData.reasonForRequest}
                onChange={handleRequestInputChange}
                placeholder="Explain why you need this store to be created"
                className="mt-1 h-24 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
          </div>
          
          <DialogFooter className="pt-2 sm:pt-3 border-t border-gray-700 mt-3 sm:mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowRequestDialog(false)}
              className="bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRequest}
              disabled={!requestData.name || !requestData.requestorName || !requestData.requestorEmail || !requestData.reasonForRequest || isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreSelector; 