import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Search, Plus, Edit, Trash, Phone, Mail, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../lib/api';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';

const StoreOwnerSuppliers = () => {
  const { selectedStore } = useAuth();
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
    isActive: true
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      
      if (!selectedStore?._id) {
        setError('No store selected');
        setLoading(false);
        return;
      }
      
      // Use the store-specific API endpoint
      const data = await getSuppliers(selectedStore._id);
      setSuppliers(data);
      setError('');
    } catch (err) {
      console.error('Suppliers fetch error:', err);
      setError('Failed to fetch suppliers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter((supplier) => {
    return (
      searchTerm === '' ||
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleDeleteSupplier = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id, selectedStore._id);
        setSuppliers(suppliers.filter(supplier => supplier._id !== id));
      } catch (error) {
        setError('Failed to delete supplier');
        console.error(error);
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
      isActive: supplier.isActive !== undefined ? supplier.isActive : true
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
      isActive: true
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
      if (!newSupplier.name || !newSupplier.contactPerson || !newSupplier.email || !newSupplier.phone) {
        setFormError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Add store ID to supplier data
      const supplierData = {
        ...newSupplier,
        store: selectedStore?._id
      };

      let result;
      if (isEditMode) {
        result = await updateSupplier(currentSupplierId, supplierData, selectedStore._id);
        // Update the supplier in the list
        setSuppliers(suppliers.map(s => s._id === currentSupplierId ? result : s));
      } else {
        result = await createSupplier(supplierData, selectedStore._id);
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
        isActive: true
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
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold">Suppliers</h2>
        <p className="text-muted-foreground">Manage your suppliers and vendor relationships.</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAddNewSupplier}
            >
              <Plus className="h-4 w-4" /> Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-emerald-700/30 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-xl font-bold text-emerald-400">{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
              <DialogDescription className="text-gray-300 text-sm mt-1">
                {isEditMode ? 'Update supplier information in your database.' : 'Add a new supplier to your database.'}
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
                  <Label htmlFor="name" className="text-gray-200">Company Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newSupplier.name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="contactPerson" className="text-gray-200">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={newSupplier.contactPerson}
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
                    value={newSupplier.email}
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
                    value={newSupplier.phone}
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
                    value={newSupplier.address.street}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address.city" className="text-gray-200">City</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={newSupplier.address.city}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address.state" className="text-gray-200">State</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={newSupplier.address.state}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address.zipCode" className="text-gray-200">Zip Code</Label>
                  <Input
                    id="address.zipCode"
                    name="address.zipCode"
                    value={newSupplier.address.zipCode}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="address.country" className="text-gray-200">Country</Label>
                  <Input
                    id="address.country"
                    name="address.country"
                    value={newSupplier.address.country}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="paymentTerms" className="text-gray-200">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    name="paymentTerms"
                    value={newSupplier.paymentTerms}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="taxId" className="text-gray-200">Tax ID</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    value={newSupplier.taxId}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="notes" className="text-gray-200">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    value={newSupplier.notes}
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
                  {isSubmitting ? 'Saving...' : isEditMode ? 'Update Supplier' : 'Add Supplier'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p>Loading suppliers...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col justify-center items-center h-64">
            <p className="text-muted-foreground mb-4">No suppliers found.</p>
            <Button onClick={handleAddNewSupplier}>
              <Plus className="mr-2 h-4 w-4" /> Add Supplier
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold">{supplier.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditSupplier(supplier)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSupplier(supplier._id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Contact: {supplier.contactPerson}
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2 pb-4">
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-2 h-4 w-4" />
                  <a href={`mailto:${supplier.email}`} className="hover:underline">{supplier.email}</a>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  <a href={`tel:${supplier.phone}`} className="hover:underline">{supplier.phone}</a>
                </div>
                {supplier.address && (
                  <div className="flex items-start text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                    <div>
                      {supplier.address.street && <div>{supplier.address.street}</div>}
                      {(supplier.address.city || supplier.address.state) && (
                        <div>
                          {supplier.address.city}{supplier.address.city && supplier.address.state ? ', ' : ''}
                          {supplier.address.state} {supplier.address.zipCode}
                        </div>
                      )}
                      {supplier.address.country && <div>{supplier.address.country}</div>}
                    </div>
                  </div>
                )}
                {supplier.paymentTerms && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">Payment Terms:</span> {supplier.paymentTerms}
                  </div>
                )}
                {supplier.taxId && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">Tax ID:</span> {supplier.taxId}
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

export default StoreOwnerSuppliers; 