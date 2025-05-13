import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Search, Plus, Edit, Trash, Phone, Mail, MapPin, User, Calendar, Store as StoreIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getAllStoresCustomers } from '../../lib/api';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';

// StoreBadge component for consistent store display
const StoreBadge = ({ store }) => {
  if (!store || !store.name) return <Badge variant="outline">Unknown Store</Badge>;
  
  // Generate color based on store name (consistent coloring)
  const storeColors = {
    default: { bg: "bg-blue-100", text: "text-blue-800" },
    store1: { bg: "bg-green-100", text: "text-green-800" },
    store2: { bg: "bg-purple-100", text: "text-purple-800" },
    store3: { bg: "bg-amber-100", text: "text-amber-800" },
    store4: { bg: "bg-pink-100", text: "text-pink-800" },
    store5: { bg: "bg-teal-100", text: "text-teal-800" }
  };
  
  // Use hash of store name to pick a consistent color
  const hash = store.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 6;
  const colorKey = `store${hash}` in storeColors ? `store${hash}` : 'default';
  const { bg, text } = storeColors[colorKey];
  
  return (
    <Badge variant="outline" className={`${bg} ${text} border-0`}>
      <StoreIcon className="mr-1 h-3 w-3" />
      {store.name}
    </Badge>
  );
};

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    storeId: ''
  });
  const [stores, setStores] = useState([]);
  const [filterStore, setFilterStore] = useState('All');

  // Helper function to get a consistent color for each store
  const getStoreColor = (store) => {
    if (!store || !store.name) return 'gray';
    
    const storeColors = ['blue', 'green', 'purple', 'amber', 'pink', 'teal'];
    const hash = store.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % storeColors.length;
    return storeColors[hash];
  };

  // Fetch customers on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        
        // Check if we're in admin path
        const isAdminPath = window.location.pathname.includes('/admin');
        
        let data;
        let storesList = [];
        
        if (isAdminPath) {
          // Use the admin-specific endpoint for all customers across stores
          console.log('Fetching customers for admin dashboard');
          const response = await getAllStoresCustomers();
          
          // Handle different response formats
          if (Array.isArray(response)) {
            data = response;
          } else if (response && response.customers && Array.isArray(response.customers)) {
            data = response.customers;
            // Extract stores from response if available
            if (response.stores && Array.isArray(response.stores)) {
              storesList = response.stores;
            }
          } else {
            console.error('Unexpected format from getAllStoresCustomers:', response);
            data = [];
          }
        } else {
          // Regular store-specific endpoint
          data = await getCustomers();
        }
        
        if (isMounted) {
          setCustomers(data);
          
          // Extract unique stores from customers if not already set
          if (storesList.length === 0 && data.length > 0) {
            const uniqueStores = [...new Map(
              data
                .filter(customer => customer.store && customer.store.name)
                .map(customer => [customer.store._id, customer.store])
            ).values()];
            
            setStores(uniqueStores);
          } else {
            setStores(storesList);
          }
          
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch customers');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter customers based on search term and store filter
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = filterStore === 'All' || 
      (customer.store && (customer.store._id === filterStore || customer.store.name === filterStore));
    
    return matchesSearch && matchesStore;
  });

  const handleDeleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomer(id)
        .then(() => {
          setCustomers(customers.filter(customer => customer._id !== id));
        })
        .catch(error => {
          console.error('Error deleting customer:', error);
          setError('Failed to delete customer');
        });
    }
  };

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={filterStore} onValueChange={setFilterStore}>
                <SelectTrigger className="w-[180px] border-2 bg-primary/10 border-primary/30 hover:bg-primary/15 transition-colors">
                  <StoreIcon className="mr-2 h-4 w-4 text-primary" />
                  <span className="font-medium">{filterStore === 'All' ? 'All Stores' : stores.find(s => s._id === filterStore)?.name || filterStore}</span>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <SelectItem value="All" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">All Stores</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store._id} value={store._id} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button onClick={() => {
                setIsEditMode(false);
                setCurrentCustomer({
                  name: '',
                  email: '',
                  phone: '',
                  location: '',
                  storeId: ''
                });
                setIsDialogOpen(true);
              }} className="flex items-center gap-2">
                <Plus size={16} />
                Add Customer
              </Button>
            </div>
          </div>
          
          {/* Store distribution summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stores.map((store) => {
              const storeCustomers = customers.filter(customer => 
                customer.store?._id === store._id || customer.storeId === store._id
              );
              const percentage = customers.length > 0 
                ? Math.round((storeCustomers.length / customers.length) * 100) 
                : 0;
              
              return (
                <Card key={store._id} className={`hover:shadow-md transition-shadow border-l-4 border-l-${getStoreColor(store)}-400`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <StoreBadge store={store} />
                      <span className="text-2xl font-bold">{storeCustomers.length}</span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {percentage}% of total customers
                    </div>
                    <div className="mt-2">
                      <Button 
                        variant="ghost" 
                        className="p-0 h-auto text-xs underline text-primary" 
                        onClick={() => setFilterStore(store._id)}
                      >
                        View customers
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Display Customers with store badge */}
          {loading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">No customers found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <Card 
                  key={customer._id} 
                  className={`hover:shadow-md transition-shadow ${customer.store ? `border-l-4 border-l-${getStoreColor(customer.store)}-400` : ''}`}
                >
                  <CardContent className="p-6">
                    {/* Add Store Badge */}
                    <div className="mb-3">
                      <StoreBadge store={customer.store} />
                    </div>
                    
                    <div className="flex justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center">
                          <User className="mr-2 h-5 w-5 text-gray-500" />
                          {customer.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          <Calendar className="inline mr-1 h-4 w-4" />
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setIsEditMode(true);
                          setCurrentCustomer({
                            ...customer,
                            storeId: customer.store ? customer.store._id : ''
                          });
                          setIsDialogOpen(true);
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer._id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-gray-500" />
                        {customer.phone || 'No Phone'}
                      </p>
                      <p className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-gray-500" />
                        {customer.email || 'No Email'}
                      </p>
                      <p className="flex items-center text-sm">
                        <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                        {customer.location || 'No Location'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-primary">
              {isEditMode ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              {isEditMode 
                ? 'Update the details of this customer.' 
                : 'Fill in the details below to add a new customer.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            // Handle submission
            if (isEditMode) {
              // Update customer
              updateCustomer(currentCustomer._id, currentCustomer)
                .then(updatedCustomer => {
                  setCustomers(customers.map(c => 
                    c._id === updatedCustomer._id ? updatedCustomer : c
                  ));
                  setIsDialogOpen(false);
                })
                .catch(error => {
                  console.error('Error updating customer:', error);
                });
            } else {
              // Create new customer
              createCustomer(currentCustomer)
                .then(newCustomer => {
                  setCustomers([...customers, newCustomer]);
                  setIsDialogOpen(false);
                })
                .catch(error => {
                  console.error('Error creating customer:', error);
                });
            }
          }} className="space-y-5 py-4 sm:py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-200 flex items-center">
                  Customer Name <span className="text-red-400 ml-1">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={currentCustomer.name || ''}
                  onChange={(e) => setCurrentCustomer({...currentCustomer, name: e.target.value})}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="storeId" className="text-sm font-semibold text-gray-200 flex items-center">
                  Store <span className="text-red-400 ml-1">*</span>
                </label>
                <select
                  id="storeId"
                  name="storeId"
                  value={currentCustomer.storeId || ''}
                  onChange={(e) => setCurrentCustomer({...currentCustomer, storeId: e.target.value})}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="" disabled>Select a store</option>
                  {stores.map(store => (
                    <option key={store._id} value={store._id}>{store.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-200">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={currentCustomer.email || ''}
                  onChange={(e) => setCurrentCustomer({...currentCustomer, email: e.target.value})}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-200">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  value={currentCustomer.phone || ''}
                  onChange={(e) => setCurrentCustomer({...currentCustomer, phone: e.target.value})}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="col-span-2 space-y-1 sm:space-y-2">
                <label htmlFor="location" className="text-sm font-semibold text-gray-200">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  value={currentCustomer.location || ''}
                  onChange={(e) => setCurrentCustomer({...currentCustomer, location: e.target.value})}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="pt-2 sm:pt-3 border-t border-gray-700 mt-3 sm:mt-4">
              <p className="text-xs text-gray-400 mb-3 sm:mb-4">Fields marked with <span className="text-red-400">*</span> are required</p>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white w-full sm:w-auto">
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={!currentCustomer.name || !currentCustomer.storeId}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full sm:w-auto"
                >
                  {isEditMode ? 'Update Customer' : 'Add Customer'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers; 