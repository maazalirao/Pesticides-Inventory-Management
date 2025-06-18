import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Search, Plus, Edit, Trash, Phone, Mail, MapPin, Store as StoreIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  getSuppliers, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier, 
  getAllStoresSuppliers,
  createSupplierAdmin,
  updateSupplierAdmin,
  deleteSupplierAdmin
} from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../components/ui/use-toast';

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

const Suppliers = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSupplierId, setCurrentSupplierId] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    taxId: '',
    paymentTerms: '',
    notes: '',
    isActive: true,
    storeId: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState([]);
  const [filterStore, setFilterStore] = useState('All');

  // Helper function to get a consistent color for each store
  const getStoreColor = (store) => {
    if (!store || !store.name) return 'gray';
    
    const storeColors = ['blue', 'green', 'purple', 'amber', 'pink', 'teal'];
    const hash = store.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % storeColors.length;
    return storeColors[hash];
  };

  // Fetch suppliers on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        
        // Check if we're in admin path
        const isAdminPath = window.location.pathname.includes('/admin');
        
        let data;
        let storesList = [];
        
        if (isAdminPath) {
          // Use the admin-specific endpoint for all suppliers across stores
          console.log('Fetching suppliers for admin dashboard');
          const response = await getAllStoresSuppliers();
          
          // Handle different response formats
          if (Array.isArray(response)) {
            data = response;
          } else if (response && response.suppliers && Array.isArray(response.suppliers)) {
            data = response.suppliers;
            // Extract stores from response if available
            if (response.stores && Array.isArray(response.stores)) {
              storesList = response.stores;
            }
          } else {
            console.error('Unexpected format from getAllStoresSuppliers:', response);
            data = [];
          }
        } else {
          // Regular store-specific endpoint
          data = await getSuppliers();
        }
        
        if (isMounted) {
          setSuppliers(data);
          
          // Extract unique stores from suppliers if not already set
          if (storesList.length === 0 && data.length > 0) {
            const uniqueStores = [...new Map(
              data
                .filter(supplier => supplier.store && supplier.store.name)
                .map(supplier => [supplier.store._id, supplier.store])
            ).values()];
            
            setStores(uniqueStores);
          } else {
            setStores(storesList);
          }
          
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to fetch suppliers');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSuppliers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter suppliers based on search term and store filter
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = filterStore === 'All' || 
      (supplier.store && (supplier.store._id === filterStore || supplier.store.name === filterStore));
    
    return matchesSearch && matchesStore;
  });

  const handleDeleteSupplier = async (supplier) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const storeId = supplier.store?._id || supplier.storeId;
        if (!storeId) {
          toast({
            title: 'Error',
            description: 'Cannot delete supplier: Store information missing',
            variant: 'destructive',
          });
          return;
        }

        await deleteSupplierAdmin(storeId, supplier._id);
        setSuppliers(suppliers.filter(s => s._id !== supplier._id));
        
        toast({
          title: 'Success',
          description: 'Supplier deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast({
          title: 'Error',
          description: typeof error === 'string' ? error : 'Failed to delete supplier',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEditSupplier = (supplier) => {
    setIsEditMode(true);
    setCurrentSupplierId(supplier._id);
    setNewSupplier({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      taxId: supplier.taxId || '',
      paymentTerms: supplier.paymentTerms || '',
      notes: supplier.notes || '',
      isActive: supplier.isActive !== undefined ? supplier.isActive : true,
      storeId: supplier.store ? supplier.store._id : ''
    });
    setIsDialogOpen(true);
  };

  const handleAddNewSupplier = () => {
    setIsEditMode(false);
    setCurrentSupplierId(null);
    setNewSupplier({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      taxId: '',
      paymentTerms: '',
      notes: '',
      isActive: true,
      storeId: ''
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setNewSupplier({
        ...newSupplier,
        address: {
          ...newSupplier.address,
          [addressField]: value
        }
      });
    } else {
      setNewSupplier({
        ...newSupplier,
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
      if (!newSupplier.name || !newSupplier.contactPerson || !newSupplier.email || !newSupplier.phone || !newSupplier.storeId) {
        setFormError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      let result;
      if (isEditMode) {
        result = await updateSupplier(currentSupplierId, newSupplier);
        // Update the supplier in the list
        setSuppliers(suppliers.map(s => s._id === currentSupplierId ? result : s));
      } else {
        result = await createSupplier(newSupplier);
        // Add the new supplier to the list
        setSuppliers([...suppliers, result]);
      }
      
      // Reset form and close dialog
      setNewSupplier({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        taxId: '',
        paymentTerms: '',
        notes: '',
        isActive: true,
        storeId: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      setFormError(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    if (address.country) parts.push(address.country);
    
    return parts.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="hidden md:block text-2xl md:text-3xl font-bold tracking-tight">Supplier Management</h1>
          <p className="hidden md:block text-muted-foreground">
            Manage your pesticide suppliers and contacts
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 whitespace-nowrap" onClick={handleAddNewSupplier}>
              <Plus className="h-4 w-4" />
              <span>Add Supplier</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-xl font-bold text-primary">
                {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm mt-1">
                {isEditMode 
                  ? 'Update the details of this supplier.' 
                  : 'Fill in the details below to add a new supplier to your system.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-4 sm:py-5">
              {formError && (
                <div className="bg-red-900/30 border border-red-500 text-red-200 px-3 py-2 sm:px-4 sm:py-3 rounded mb-3 sm:mb-4 text-sm">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-200 flex items-center">
                    Supplier Name <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={newSupplier.name}
                    onChange={handleInputChange}
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
                    value={newSupplier.storeId}
                    onChange={handleInputChange}
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
                  <label htmlFor="contactPerson" className="text-sm font-semibold text-gray-200">
                    Contact Person
                  </label>
                  <input
                    id="contactPerson"
                    name="contactPerson"
                    value={newSupplier.contactPerson}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
                    value={newSupplier.email}
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
                    value={newSupplier.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="address" className="text-sm font-semibold text-gray-200">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    value={newSupplier.address}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="city" className="text-sm font-semibold text-gray-200">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={newSupplier.city}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="state" className="text-sm font-semibold text-gray-200">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    value={newSupplier.state}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="zipCode" className="text-sm font-semibold text-gray-200">
                    Zip Code
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    value={newSupplier.zipCode}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="taxId" className="text-sm font-semibold text-gray-200">
                    Tax ID / GST
                  </label>
                  <input
                    id="taxId"
                    name="taxId"
                    value={newSupplier.taxId}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label htmlFor="productCategories" className="text-sm font-semibold text-gray-200">
                    Product Categories
                  </label>
                  <input
                    id="productCategories"
                    name="productCategories"
                    value={newSupplier.productCategories}
                    onChange={handleInputChange}
                    placeholder="e.g. Insecticides, Herbicides"
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="notes" className="text-sm font-semibold text-gray-200">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newSupplier.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
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
                      : (isEditMode ? 'Update Supplier' : 'Create Supplier')}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Store distribution summary - moved from bottom to top */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stores.map((store) => {
          const storeSuppliers = suppliers.filter(supplier => 
            supplier.store?._id === store._id || supplier.storeId === store._id
          );
          const percentage = suppliers.length > 0 
            ? Math.round((storeSuppliers.length / suppliers.length) * 100) 
            : 0;
          
          return (
            <Card key={store._id} className={`hover:shadow-md transition-shadow border-l-4 border-l-${getStoreColor(store)}-400`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <StoreBadge store={store} />
                  <span className="text-2xl font-bold">{storeSuppliers.length}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {percentage}% of total suppliers
                </div>
                <div className="mt-2">
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto text-xs underline text-primary" 
                    onClick={() => setFilterStore(store._id)}
                  >
                    View suppliers
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
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
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Loading suppliers...</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredSuppliers.map((supplier) => (
                <Card key={supplier._id} className="overflow-hidden relative">
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{supplier.name}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.isActive 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
                      
                      <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{supplier.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span>{supplier.phone}</span>
                        </div>
                        <div className="flex">
                          <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{formatAddress(supplier.address)}</span>
                        </div>
                      </div>
                      
                      {supplier.taxId && (
                        <div className="mt-3 sm:mt-4">
                          <p className="text-xs text-muted-foreground mb-1.5">Tax ID: {supplier.taxId}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 sm:mt-6 flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 h-8 px-2.5 sm:px-3"
                          onClick={() => handleEditSupplier(supplier)}
                        >
                          <Edit className="h-3 w-3" />
                          <span className="sm:inline">Edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1 h-8 px-2.5 sm:px-3 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
                          onClick={() => handleDeleteSupplier(supplier)}
                        >
                          <Trash className="h-3 w-3" />
                          <span className="sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Bottom color indicator */}
                    <div className={`absolute bottom-0 left-0 right-0 h-2 ${
                      supplier.isActive 
                        ? 'bg-gradient-to-r from-orange-200 to-orange-500 dark:from-orange-900 dark:to-orange-600'
                        : 'bg-gradient-to-r from-red-200 to-red-500 dark:from-red-900 dark:to-red-600'
                    }`}></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredSuppliers.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No suppliers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers; 