import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Search, Plus, Edit, Trash, Phone, Mail, MapPin, User, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../lib/api';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { getMockCustomers } from '../../lib/mockData';

const StoreOwnerCustomers = () => {
  const { selectedStore } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    paymentMethod: '',
    taxId: '',
    notes: '',
    isActive: true
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      if (!selectedStore?._id) {
        setError('No store selected');
        setLoading(false);
        return;
      }
      
      // Use the store-specific API endpoint 
      const data = await getCustomers(selectedStore._id);
      
      // Process the response to ensure we only get customers for this specific store
      let storeCustomers = [];
      
      if (data && Array.isArray(data)) {
        // If it's already an array, filter for this store's customers
        storeCustomers = data.filter(customer => 
          customer.store === selectedStore._id || 
          customer.store?._id === selectedStore._id
        );
      } else if (data?.customers && Array.isArray(data.customers)) {
        // If the API returns a nested customers array, filter for this store's customers
        storeCustomers = data.customers.filter(customer => 
          customer.store === selectedStore._id || 
          customer.store?._id === selectedStore._id
        );
      }
      
      console.log(`Found ${storeCustomers.length} customers for store ${selectedStore._id}`);
      setCustomers(storeCustomers);
      setError('');
    } catch (err) {
      console.error('Customers fetch error:', err);
      setError('Using demo data - API connection failed.');
      // Use mock data as fallback
      console.log('Loading mock customers data as fallback...');
      const mockCustomers = getMockCustomers();
      setCustomers(mockCustomers);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = (customers || []).filter((customer) => {
    return (
      searchTerm === '' ||
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id, selectedStore._id);
        setCustomers(customers.filter(customer => customer._id !== id));
      } catch (error) {
        setError('Failed to delete customer');
        console.error(error);
      }
    }
  };

  const handleEditCustomer = (customer) => {
    setIsEditMode(true);
    setCurrentCustomerId(customer._id);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      paymentMethod: customer.paymentMethod || '',
      taxId: customer.taxId || '',
      notes: customer.notes || '',
      isActive: customer.isActive !== undefined ? customer.isActive : true
    });
    setIsDialogOpen(true);
  };

  const handleAddNewCustomer = () => {
    setIsEditMode(false);
    setCurrentCustomerId(null);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      paymentMethod: '',
      taxId: '',
      notes: '',
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setNewCustomer({
        ...newCustomer,
        address: {
          ...newCustomer.address,
          [addressField]: value
        }
      });
    } else {
      setNewCustomer({
        ...newCustomer,
        [name]: name === 'isActive' ? e.target.checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
        setFormError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Add store ID to customer data
      const customerData = {
        ...newCustomer,
        store: selectedStore?._id
      };

      let result;
      if (isEditMode) {
        result = await updateCustomer(currentCustomerId, customerData, selectedStore._id);
        // Update the customer in the list
        setCustomers(customers.map(c => c._id === currentCustomerId ? result : c));
      } else {
        result = await createCustomer(customerData, selectedStore._id);
        // Add the new customer to the list
        setCustomers([...customers, result]);
      }
      
      // Reset form and close dialog
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        paymentMethod: '',
        taxId: '',
        notes: '',
        isActive: true
      });
      setIsDialogOpen(false);
    } catch (error) {
      setFormError(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format customer type badge color
  const getTypeColor = (type) => {
    switch (type) {
      case 'Business':
        return 'bg-blue-100 text-blue-800';
      case 'Individual':
        return 'bg-purple-100 text-purple-800';
      case 'Government':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold">Customers</h2>
        <p className="text-muted-foreground">Manage your store's customer information and relationships.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search customers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAddNewCustomer}
            >
              <Plus className="h-4 w-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-emerald-700/30 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-xl font-bold text-emerald-400">
                {isEditMode ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm mt-1">
                {isEditMode ? 'Update customer information in your database.' : 'Add a new customer to your database.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-4">
              {formError && (
                <div className="bg-red-900/30 border border-red-500 text-red-200 px-3 py-2 rounded mb-3 text-sm">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="col-span-2">
                  <Label htmlFor="name" className="text-gray-200">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-200">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-200">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="address.street" className="text-gray-200">Street Address</Label>
                  <Input
                    id="address.street"
                    name="address.street"
                    value={newCustomer.address.street}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address.city" className="text-gray-200">City</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={newCustomer.address.city}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address.state" className="text-gray-200">State</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={newCustomer.address.state}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address.zipCode" className="text-gray-200">Zip Code</Label>
                  <Input
                    id="address.zipCode"
                    name="address.zipCode"
                    value={newCustomer.address.zipCode}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address.country" className="text-gray-200">Country</Label>
                  <Input
                    id="address.country"
                    name="address.country"
                    value={newCustomer.address.country}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMethod" className="text-gray-200">Payment Method</Label>
                  <Input
                    id="paymentMethod"
                    name="paymentMethod"
                    value={newCustomer.paymentMethod}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="taxId" className="text-gray-200">Tax ID</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={newCustomer.taxId}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes" className="text-gray-200">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={newCustomer.notes}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <DialogFooter className="border-t border-gray-700 pt-4 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Customer' : 'Add Customer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p>Loading customers...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col justify-center items-center h-64">
            <p className="text-muted-foreground mb-4">No customers found.</p>
            <Button onClick={handleAddNewCustomer}>
              <Plus className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{customer.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditCustomer(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCustomer(customer._id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {customer.customerType && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(customer.customerType)}`}>
                    {customer.customerType}
                  </span>
                )}
              </CardHeader>
              <CardContent className="text-sm space-y-2 pb-4">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  <a href={`mailto:${customer.email}`} className="hover:underline">{customer.email}</a>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  <a href={`tel:${customer.phone}`} className="hover:underline">{customer.phone}</a>
                </div>
                {customer.address && (
                  <div className="flex items-start text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                    <div>
                      {customer.address.street && <div>{customer.address.street}</div>}
                      {(customer.address.city || customer.address.state) && (
                        <div>
                          {customer.address.city}{customer.address.city && customer.address.state ? ', ' : ''}
                          {customer.address.state} {customer.address.zipCode}
                        </div>
                      )}
                      {customer.address.country && <div>{customer.address.country}</div>}
                    </div>
                  </div>
                )}
                {customer.lastOrderDate && (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Last Order: {formatDate(customer.lastOrderDate)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreOwnerCustomers; 