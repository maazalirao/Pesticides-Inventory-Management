import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import {
  Store,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  Edit,
  Save,
  Building,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const StoreProfile = () => {
  const { selectedStore, token, refreshStores } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    status: 'active'
  });
  
  useEffect(() => {
    if (selectedStore) {
      setStoreData({
        name: selectedStore.name || '',
        description: selectedStore.description || '',
        email: selectedStore.email || '',
        phone: selectedStore.phone || '',
        address: {
          street: selectedStore.address?.street || '',
          city: selectedStore.address?.city || '',
          state: selectedStore.address?.state || '',
          postalCode: selectedStore.address?.postalCode || '',
          country: selectedStore.address?.country || '',
        },
        status: selectedStore.status || 'active'
      });
    }
  }, [selectedStore]);
  
  const handleEditToggle = () => {
    setEditing(!editing);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setStoreData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSave = async () => {
    if (!selectedStore) {
      toast({
        title: 'Error',
        description: 'No store selected',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.put(`/api/stores/${selectedStore._id}`, storeData, config);
      
      // Refresh store data
      await refreshStores();
      
      toast({
        title: 'Success',
        description: 'Store information updated successfully',
      });
      
      setEditing(false);
    } catch (error) {
      console.error('Error updating store:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update store information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form data to original data
    if (selectedStore) {
      setStoreData({
        name: selectedStore.name || '',
        description: selectedStore.description || '',
        email: selectedStore.email || '',
        phone: selectedStore.phone || '',
        address: {
          street: selectedStore.address?.street || '',
          city: selectedStore.address?.city || '',
          state: selectedStore.address?.state || '',
          postalCode: selectedStore.address?.postalCode || '',
          country: selectedStore.address?.country || '',
        },
        status: selectedStore.status || 'active'
      });
    }
    setEditing(false);
  };

  // Format address for display
  const formatAddress = () => {
    if (!selectedStore || !selectedStore.address) return 'No address provided';
    
    const { street, city, state, postalCode, country } = selectedStore.address;
    const parts = [street, city, state, postalCode, country].filter(Boolean);
    
    return parts.join(', ');
  };

  if (!selectedStore) {
    return (
      <div className="flex flex-col space-y-6 p-6">
        <Card className="p-8 text-center">
          <CardContent>
            <Store className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No Store Selected</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any store assigned yet or haven't selected a store.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold">Store Profile</h2>
        <p className="text-muted-foreground">View and manage your store information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Store Info */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Basic details about your store</CardDescription>
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-600">Active</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Store Name</label>
                  <Input
                    name="name"
                    value={storeData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Textarea
                    name="description"
                    value={storeData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input
                      name="email"
                      value={storeData.email}
                      onChange={handleInputChange}
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Phone</label>
                    <Input
                      name="phone"
                      value={storeData.phone}
                      onChange={handleInputChange}
                      type="tel"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Address</label>
                  <Input
                    name="address.street"
                    value={storeData.address.street}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">City</label>
                    <Input
                      name="address.city"
                      value={storeData.address.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">State</label>
                    <Input
                      name="address.state"
                      value={storeData.address.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Postal Code</label>
                    <Input
                      name="address.postalCode"
                      value={storeData.address.postalCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Country</label>
                    <Input
                      name="address.country"
                      value={storeData.address.country}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mr-4">
                    <Store className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{storeData.name}</h3>
                    <p className="text-muted-foreground">{storeData.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-muted-foreground">{storeData.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-muted-foreground">{storeData.phone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                      <div>
                        <div className="font-medium">Address</div>
                        <div className="text-muted-foreground">{formatAddress()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                      <div>
                        <div className="font-medium">Status</div>
                        <div className="text-muted-foreground">{storeData.status.charAt(0).toUpperCase() + storeData.status.slice(1)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {editing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="mr-2 h-4 w-4" /> 
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={handleEditToggle} className="bg-emerald-600 hover:bg-emerald-700">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Legal and Compliance */}
        <Card>
          <CardHeader>
            <CardTitle>Legal & Compliance</CardTitle>
            <CardDescription>Regulatory information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-4 mb-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-emerald-800 dark:text-emerald-300">Compliance Status</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">Your store is fully compliant with all regulations.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Tax ID</div>
                <div className="font-medium">{storeData.taxId}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Pesticide License Number</div>
                <div className="font-medium">{storeData.licenseNumber}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">License Expiration</div>
                <div className="font-medium">December 31, 2023</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Last Inspection</div>
                <div className="font-medium">June 15, 2023</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Inspection Result</div>
                <div className="font-medium text-emerald-600">Passed</div>
              </div>
            </div>
            
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 mt-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Upcoming Renewal</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">Your pesticide license will need renewal in 45 days.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Compliance Documents
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StoreProfile; 