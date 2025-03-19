import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Plus, Edit, Trash, Phone, Mail, MapPin, User, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../lib/api';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Customers = () => {
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
      const data = await getCustomers();
      setCustomers(data);
      setError('');
    } catch (err) {
      console.error('Customers fetch error:', err);
      setError('Failed to fetch customers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
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
        await deleteCustomer(id);
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

      let result;
      if (isEditMode) {
        result = await updateCustomer(currentCustomerId, newCustomer);
        // Update the customer in the list
        setCustomers(customers.map(c => c._id === currentCustomerId ? result : c));
      } else {
        result = await createCustomer(newCustomer);
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
      case 'Educational':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="hidden md:block text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="hidden md:block text-muted-foreground">
            Manage your customers and their information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 whitespace-nowrap" onClick={handleAddNewCustomer}>
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-xl font-bold text-primary">
                {isEditMode ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm mt-1">
                {isEditMode ? 'Update customer information below.' : 'Fill in the customer information below.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-4 sm:py-5">
              {error && (
                <div className="bg-red-900/30 border border-red-500 text-red-200 px-3 py-2 sm:px-4 sm:py-3 rounded mb-3 sm:mb-4 text-sm">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-200 flex items-center">
                    Customer Name <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-200 flex items-center">
                    Email <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="phone" className="text-sm font-semibold text-gray-200 flex items-center">
                    Phone <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="address.street" className="text-sm font-semibold text-gray-200">
                    Street Address
                  </label>
                  <input
                    id="address.street"
                    name="address.street"
                    value={newCustomer.address.street}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="address.city" className="text-sm font-semibold text-gray-200">
                    City
                  </label>
                  <input
                    id="address.city"
                    name="address.city"
                    value={newCustomer.address.city}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="customerType" className="text-sm font-semibold text-gray-200">
                    Customer Type
                  </label>
                  <select
                    id="customerType"
                    name="customerType"
                    value={newCustomer.customerType || ""}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="" disabled>Select customer type</option>
                    <option value="retail">Retail</option>
                    <option value="wholesale">Wholesale</option>
                    <option value="distributor">Distributor</option>
                  </select>
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
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full sm:w-auto"
                  >
                    {isSubmitting 
                      ? (isEditMode ? 'Updating...' : 'Creating...') 
                      : (isEditMode ? 'Update Customer' : 'Add Customer')}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="pl-10 w-full rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <Card key={customer._id} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg">{customer.name}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {customer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.address && customer.address.street && (
                          <div className="flex items-start text-sm">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                            <span>
                              {customer.address.street}
                              {customer.address.city && `, ${customer.address.city}`}
                              {customer.address.state && `, ${customer.address.state}`}
                              {customer.address.zipCode && ` ${customer.address.zipCode}`}
                              {customer.address.country && `, ${customer.address.country}`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 sm:mt-6 flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 h-8 px-2.5 sm:px-3"
                          onClick={() => handleEditCustomer(customer)}
                        >
                          <Edit className="h-3 w-3" />
                          <span className="sm:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 h-8 px-2.5 sm:px-3 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                          onClick={() => handleDeleteCustomer(customer._id)}
                        >
                          <Trash className="h-3 w-3" />
                          <span className="sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Bottom color indicator */}
                    <div className={`absolute bottom-0 left-0 right-0 h-2 ${
                      customer.isActive 
                        ? 'bg-gradient-to-r from-blue-200 to-blue-500 dark:from-blue-900 dark:to-blue-600'
                        : 'bg-gradient-to-r from-red-200 to-red-500 dark:from-red-900 dark:to-red-600'
                    }`}></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredCustomers.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers; 