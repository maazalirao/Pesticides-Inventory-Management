import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Store, MapPin, Phone, Mail, ChevronRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';

// The base URL for the API
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'  // For development
  : '/api';  // For production, use relative URL

const StoreShowcase = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all active stores
        const response = await axios.get(`${API_URL}/stores/public`);
        const fetchedStores = response.data;
        
        console.log('StoreShowcase: Stores fetched:', fetchedStores);
        setStores(fetchedStores);
        
        // Check if a store was previously selected
        const previouslySelectedStoreId = localStorage.getItem('selectedStoreId');
        if (previouslySelectedStoreId) {
          const previousStore = fetchedStores.find(store => store._id === previouslySelectedStoreId);
          if (previousStore) {
            setSelectedStore(previousStore);
          }
        }
      } catch (error) {
        console.error('Failed to load stores:', error);
        setError('Could not retrieve store information');
        
        // Fallback to mock data if API fails
        const mockStores = [
          {
            _id: '1',
            name: 'Maaz Pesticides',
            description: 'Quality pesticides and agricultural products for all your farming needs.',
            address: { city: 'Lahore', state: 'Punjab' },
            phone: '+92-300-1234567',
            email: 'contact@maazpesticides.com',
            status: 'active'
          },
          {
            _id: '2',
            name: 'Ali Agricultural Supplies',
            description: 'Serving farmers with the best agricultural products since 2005.',
            address: { city: 'Karachi', state: 'Sindh' },
            phone: '+92-300-7654321',
            email: 'info@aliagrisupplies.com',
            status: 'active'
          },
          {
            _id: '3',
            name: 'Rao Farming Solutions',
            description: 'Your one-stop shop for all farming and pest control products.',
            address: { city: 'Islamabad', state: 'Federal' },
            phone: '+92-300-9876543',
            email: 'sales@raofarmingsolutions.com',
            status: 'active'
          }
        ];
        
        setStores(mockStores);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStores();
  }, []);

  const handleStoreSelect = (store) => {
    console.log('Store selected:', store.name, store._id);
    
    // Update state
    setSelectedStore(store);
    
    // Save to localStorage
    localStorage.setItem('selectedStoreId', store._id);
    
    // Show toast notification
    toast({
      title: 'Store Selected',
      description: `You are now browsing products from ${store.name}`,
    });
    
    // Force a complete page reload to ensure all components reflect the new store
    console.log('Redirecting to products with store filter:', store._id);
    
    // Use window.location for a complete page reload
    window.location.href = `/store/products?store=${store._id}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 my-4">
        <p className="font-medium">Error loading stores</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12 text-center">
          <Store className="w-12 h-12 text-green-600 mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Stores</h2>
          <p className="text-lg text-gray-600 max-w-2xl">
            Choose from our network of trusted stores offering quality pesticides and agricultural products.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store._id} className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${selectedStore?._id === store._id ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold">{store.name}</CardTitle>
                  {selectedStore?._id === store._id && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Selected
                    </Badge>
                  )}
                </div>
                <CardDescription>{store.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {store.address && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        {store.address.city}, {store.address.state}
                      </div>
                    </div>
                  )}
                  
                  {store.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-500 mr-2" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  
                  {store.email && (
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-sm">{store.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between bg-gray-50 px-6 py-4">
                <div className="flex items-center text-green-700">
                  <ShieldCheck className="w-5 h-5 mr-1" />
                  <span className="text-sm font-medium">Verified Store</span>
                </div>
                <Button 
                  variant={selectedStore?._id === store._id ? "secondary" : "default"}
                  className={selectedStore?._id === store._id ? "bg-green-700 text-white hover:bg-green-800" : ""}
                  onClick={() => handleStoreSelect(store)}
                >
                  {selectedStore?._id === store._id ? 'Selected' : 'Select Store'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreShowcase; 