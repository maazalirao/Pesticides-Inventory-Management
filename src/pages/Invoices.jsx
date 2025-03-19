import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Plus, Edit, Download, Eye, Trash, Filter, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus } from '../lib/api';

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('invoices');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    
    customer: {
      name: '',
      email: '',
      address: ''
    },
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    dueDate: '',
    notes: '',
    status: 'draft'
  });

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await getInvoices();
      setInvoices(data || []);
      setError('');
    } catch (err) {
      console.error('Invoices fetch error:', err);
      setError('Failed to fetch invoices. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format date for input field
  const formatDateForInput = (dateObj) => {
    try {
      return format(dateObj, 'yyyy-MM-dd');
    } catch (error) {
      return '';
    }
  };

  // Filter based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    return (
      (searchTerm === '' || 
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'All' || invoice.status === filterStatus.toLowerCase())
    );
  });

  const filteredBills = bills.filter((bill) => {
    return (
      (searchTerm === '' || 
        bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.supplier.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'All' || bill.status === filterStatus)
    );
  });

  // Status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
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

  // Handle item change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newInvoice.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].total = quantity * unitPrice;
    }
    
    // Recalculate invoice totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = subtotal * 0.17; // 17% GST for example
    const total = subtotal + tax;
    
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
  };
  
  // Add new item
  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    });
  };
  
  // Remove item
  const handleRemoveItem = (index) => {
    if (newInvoice.items.length === 1) return; // Keep at least one item
    
    const updatedItems = newInvoice.items.filter((_, i) => i !== index);
    
    // Recalculate invoice totals
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = subtotal * 0.17; // 17% GST
    const total = subtotal + tax;
    
    setNewInvoice({
      ...newInvoice,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  // Reset invoice form
  const resetInvoiceForm = () => {
    setNewInvoice({
      customer: {
        name: '',
        email: '',
        address: ''
      },
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
      dueDate: formatDateForInput(new Date(Date.now() + 30*24*60*60*1000)), // Default due date: 30 days from now
      notes: '',
      status: 'draft'
    });
    setIsEditMode(false);
    setCurrentInvoiceId(null);
  };

  // Handle new invoice dialog
  const handleAddNewInvoice = () => {
    resetInvoiceForm();
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  // Handle edit invoice
  const handleEditInvoice = (invoice) => {
    setIsEditMode(true);
    setCurrentInvoiceId(invoice._id);
    setNewInvoice({
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email || '',
        address: invoice.customer.address || ''
      },
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      dueDate: formatDateForInput(new Date(invoice.dueDate)),
      notes: invoice.notes || '',
      status: invoice.status
    });
    setIsDialogOpen(true);
  };
  
  // Create new invoice
  const handleCreateInvoice = async () => {
    try {
      setIsSubmitting(true);
      setFormError('');

      // Validate form
      if (!newInvoice.customer.name || !newInvoice.dueDate || newInvoice.items.length === 0) {
        setFormError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Check if any item is empty
      for (const item of newInvoice.items) {
        if (!item.description || item.quantity <= 0 || item.unitPrice <= 0) {
          setFormError('Please complete all item details');
          setIsSubmitting(false);
          return;
        }
      }

      const result = await createInvoice(newInvoice);
      
      // Add the new invoice to the list
      setInvoices([result, ...invoices]);
      
      // Reset form and close dialog
      resetInvoiceForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setFormError(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing invoice
  const handleUpdateInvoice = async () => {
    try {
      setIsSubmitting(true);
      setFormError('');

      // Validate form
      if (!newInvoice.customer.name || !newInvoice.dueDate || newInvoice.items.length === 0) {
        setFormError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      const result = await updateInvoice(currentInvoiceId, newInvoice);
      
      // Update the invoice in the list
      setInvoices(invoices.map(inv => inv._id === currentInvoiceId ? result : inv));
      
      // Reset form and close dialog
      resetInvoiceForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setFormError(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoice(id);
        
        // Remove the invoice from the list
        setInvoices(invoices.filter(inv => inv._id !== id));
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setError('Failed to delete invoice');
      }
    }
  };
  
  // Handle invoice submission
  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    
    if (isEditMode) {
      handleUpdateInvoice();
    } else {
      handleCreateInvoice();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="hidden md:block text-3xl font-bold tracking-tight">Invoice & Billing</h1>
          <p className="hidden md:block text-muted-foreground">
            Manage your invoices, bills, and financial transactions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-2"
              onClick={() => activeTab === 'invoices' ? handleAddNewInvoice() : null}
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'invoices' ? 'Create New Invoice' : 'Add New Bill'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-xl font-bold text-primary">
                {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm mt-1">
                {isEditMode 
                  ? 'Update the details of this invoice.' 
                  : 'Fill in the details below to create a new invoice.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitInvoice} className="space-y-5 py-5">
              {formError && (
                <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                  {formError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="customerName" className="text-sm font-semibold text-gray-200 flex items-center">
                    Customer Name <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    value={newInvoice.customer.name}
                    onChange={(e) => setNewInvoice({...newInvoice, customer: {...newInvoice.customer, name: e.target.value}})}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="customerEmail" className="text-sm font-semibold text-gray-200 flex items-center">
                    Customer Email
                  </label>
                  <input
                    id="customerEmail"
                    name="customerEmail"
                    value={newInvoice.customer.email}
                    onChange={(e) => setNewInvoice({...newInvoice, customer: {...newInvoice.customer, email: e.target.value}})}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="customerAddress" className="text-sm font-semibold text-gray-200 flex items-center">
                    Customer Address
                  </label>
                  <textarea
                    id="customerAddress"
                    name="customerAddress"
                    value={newInvoice.customer.address}
                    onChange={(e) => setNewInvoice({...newInvoice, customer: {...newInvoice.customer, address: e.target.value}})}
                    rows="3"
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  ></textarea>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="dueDate" className="text-sm font-semibold text-gray-200 flex items-center">
                    Due Date <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                  <h3 className="text-sm font-semibold text-gray-200">Invoice Items</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddItem}
                    className="bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700 hover:text-white text-xs px-2 py-1 h-7"
                  >
                    Add Item
                  </Button>
                </div>
                
                {newInvoice.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input 
                        placeholder="Product description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        min="0"
                        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center h-10 border border-gray-700 bg-gray-800 px-3 rounded-md text-gray-300">
                        {formatCurrency(item.total || 0)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button 
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={newInvoice.items.length === 1}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <div className="space-y-2">
                  <label htmlFor="notes" className="text-sm font-semibold text-gray-200">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Additional notes for this invoice"
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                    rows="3"
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  ></textarea>
                </div>
                
                <div className="space-y-2 border-t border-gray-700 pt-4 md:pt-0 md:border-0">
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-300">Subtotal:</span>
                    <span className="text-white">{formatCurrency(newInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1">
                    <span className="text-gray-300">Tax (17%):</span>
                    <span className="text-white">{formatCurrency(newInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between font-medium py-2 border-t border-gray-700 mt-2">
                    <span className="text-gray-200">Total:</span>
                    <span className="text-primary text-lg">{formatCurrency(newInvoice.total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-700 mt-6">
                <p className="text-xs text-gray-400 mb-4">Fields marked with <span className="text-red-400">*</span> are required</p>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'invoices'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'bills'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setActiveTab('bills')}
        >
          Bills
        </button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{activeTab === 'invoices' ? 'Invoices' : 'Bills'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'invoices' ? "Search invoices..." : "Search bills..."}
                className="pl-10 w-full rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative inline-block w-48">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-md border border-input bg-background py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="All">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="py-3 px-2 sm:px-4 text-left font-medium">{activeTab === 'invoices' ? 'Invoice #' : 'Bill #'}</th>
                  <th className="py-3 px-2 sm:px-4 text-left font-medium">{activeTab === 'invoices' ? 'Customer' : 'Supplier'}</th>
                  <th className="py-3 px-2 sm:px-4 text-left font-medium hidden sm:table-cell">Date</th>
                  <th className="py-3 px-2 sm:px-4 text-left font-medium hidden md:table-cell">Due Date</th>
                  <th className="py-3 px-2 sm:px-4 text-right font-medium">Amount</th>
                  <th className="py-3 px-2 sm:px-4 text-center font-medium">Status</th>
                  <th className="py-3 px-2 sm:px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'invoices' ? filteredInvoices : []).map((invoice) => (
                  <tr key={invoice._id} className="border-b hover:bg-muted/25">
                    <td className="py-3 px-2 sm:px-4 font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <div>
                        <p className="truncate max-w-[100px] sm:max-w-[150px]">{invoice.customer.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[150px]">
                          {invoice.customer.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">{formatDate(invoice.createdAt)}</td>
                    <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                      <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                        {formatDate(invoice.dueDate)}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4 font-medium text-right">{formatCurrency(invoice.total)}</td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      <span className={`px-2 py-1 inline-flex items-center justify-center rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                          onClick={() => handleEditInvoice(invoice)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteInvoice(invoice._id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mobile view for small screens */}
            <div className="sm:hidden mt-2 px-2">
              <p className="text-xs text-muted-foreground italic">
                Swipe horizontally to see more columns
              </p>
            </div>
          </div>

          {(activeTab === 'invoices' ? filteredInvoices : []).length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No {activeTab === 'invoices' ? 'invoices' : 'bills'} found
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {(activeTab === 'invoices' ? filteredInvoices : []).length} {activeTab}
            </p>
            <div className="flex gap-1 mt-3 sm:mt-0">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices; 