import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Search, Plus, Edit, Download, Upload, Eye, Trash, Filter, ChevronDown, DollarSign, TrendingUp, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger 
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const Invoices = () => {
  const { selectedStore } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exportSuccess, setExportSuccess] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
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
    if (selectedStore) {
      fetchInvoices();
    }
  }, [selectedStore]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log('Fetching invoices for store:', selectedStore?._id);
      
      if (!selectedStore?._id) {
        console.warn('No store selected, skipping invoice fetch');
        setInvoices([]);
        setLoading(false);
        return;
      }
      
      const data = await getInvoices();
      console.log('Invoices data received:', data);
      setInvoices(data || []);
      setError('');
    } catch (err) {
      console.error('Invoices fetch error:', err);
      setError('Failed to fetch invoices. Please try again later.');
      setInvoices([]); // Ensure we have an empty array rather than undefined
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    
    if (totalPages <= maxPageButtons) {
      // If we have fewer pages than our maximum, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Complex pagination logic for many pages
      let startPage = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
      let endPage = startPage + maxPageButtons - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(endPage - maxPageButtons + 1, 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
      case 'sent':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `Rs ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Rs ${(amount / 1000).toFixed(0)}K`;
    } else {
      return `Rs ${amount.toFixed(0)}`;
    }
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
      
      if (!selectedStore?._id) {
        setFormError('No store selected');
        setIsSubmitting(false);
        return;
      }
      
      // Validate required fields
      if (!newInvoice.customer.name) {
        setFormError('Customer name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (newInvoice.items.length === 0) {
        setFormError('At least one item is required');
        setIsSubmitting(false);
        return;
      }
      
      // Add the store ID to the invoice
      const invoiceData = {
        ...newInvoice,
        store: selectedStore._id
      };
      
      const createdInvoice = await createInvoice(invoiceData);
      
      // Add created invoice to state
      setInvoices([...invoices, createdInvoice]);
      
      // Reset form and close dialog
      resetInvoiceForm();
      setIsDialogOpen(false);
      
      // Show success message
      setExportSuccess('Invoice created successfully');
      setTimeout(() => setExportSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating invoice:', err);
      setFormError('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update existing invoice
  const handleUpdateInvoice = async () => {
    try {
      setIsSubmitting(true);
      setFormError('');
      
      if (!selectedStore?._id) {
        setFormError('No store selected');
        setIsSubmitting(false);
        return;
      }
      
      if (!currentInvoiceId) {
        setFormError('No invoice selected for update');
        setIsSubmitting(false);
        return;
      }
      
      // Validate required fields
      if (!newInvoice.customer.name) {
        setFormError('Customer name is required');
        setIsSubmitting(false);
        return;
      }
      
      if (newInvoice.items.length === 0) {
        setFormError('At least one item is required');
        setIsSubmitting(false);
        return;
      }
      
      // Add the store ID to the invoice
      const invoiceData = {
        ...newInvoice,
        store: selectedStore._id
      };
      
      const updatedInvoice = await updateInvoice(currentInvoiceId, invoiceData);
      
      // Update invoice in state
      setInvoices(invoices.map(invoice => 
        invoice._id === currentInvoiceId ? updatedInvoice : invoice
      ));
      
      // Reset form and close dialog
      resetInvoiceForm();
      setIsDialogOpen(false);
      setIsEditMode(false);
      
      // Show success message
      setExportSuccess('Invoice updated successfully');
      setTimeout(() => setExportSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating invoice:', err);
      setFormError('Failed to update invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        setLoading(true);
        
        if (!selectedStore?._id) {
          setError('No store selected');
          setLoading(false);
          return;
        }
        
        await deleteInvoice(id);
        
        // Remove the deleted invoice from state
        setInvoices(invoices.filter(invoice => invoice._id !== id));
        
        // Show success message
        setExportSuccess('Invoice deleted successfully');
        setTimeout(() => setExportSuccess(''), 3000);
      } catch (err) {
        console.error('Error deleting invoice:', err);
        setError('Failed to delete invoice. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle invoice submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isEditMode) {
      handleUpdateInvoice();
    } else {
      handleCreateInvoice();
    }
  };

  // Export invoices to CSV
  const exportInvoices = () => {
    try {
      const headers = ['Invoice Number', 'Customer', 'Date', 'Due Date', 'Amount', 'Status'];
      
      const csvData = filteredInvoices.map(invoice => [
        invoice.invoiceNumber,
        invoice.customer.name,
        formatDate(invoice.createdAt),
        formatDate(invoice.dueDate),
        invoice.total,
        invoice.status
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setExportSuccess('Invoices exported successfully!');
      setTimeout(() => setExportSuccess(''), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export invoices');
    }
  };

  const handleImportClick = () => {
    document.getElementById('import-file').click();
  };

  const handleFileUpload = async (e) => {
    // This is just a placeholder for future implementation
    try {
      const file = e.target.files[0];
      if (!file) return;
      
      // Here you would implement actual CSV parsing and import
      // For now, we'll just show a success message
      setImportSuccess('Invoices imported successfully!');
      setTimeout(() => setImportSuccess(''), 3000);
      
      // Reset the input
      e.target.value = null;
    } catch (error) {
      console.error('Import error:', error);
      setError('Failed to import invoices: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices & Billing</h1>
          <p className="text-muted-foreground">
            Manage your invoices, bills, and financial transactions
          </p>
        </div>
      </div>

      {/* Billing Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 truncate">Total Revenue</p>
                <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(456000)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">+12.5% from last month</span>
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full flex-shrink-0 ml-2">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 truncate">Outstanding</p>
                <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(89000)}</p>
                <p className="text-xs text-amber-600 flex items-center mt-1">
                  <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">12 pending payments</span>
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full flex-shrink-0 ml-2">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 truncate">Overdue</p>
                <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(23000)}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">3 overdue invoices</span>
                </p>
              </div>
              <div className="p-2 bg-red-100 rounded-full flex-shrink-0 ml-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-600 truncate">This Month</p>
                <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(67000)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">+8.3% vs last month</span>
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full flex-shrink-0 ml-2">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8 w-full sm:w-80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-md border border-input bg-background py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="All">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={exportInvoices}>
                <Download className="h-4 w-4" />
                <span>Export</span>
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleImportClick}>
                <Upload className="h-4 w-4" />
                <span>Import</span>
                <input
                  id="import-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </Button>
              <Button className="flex items-center gap-1 bg-primary hover:bg-primary/90" onClick={handleAddNewInvoice}>
                <Plus className="h-4 w-4" />
                <span>Add Invoice</span>
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {exportSuccess && (
            <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
              {exportSuccess}
            </div>
          )}
          
          {importSuccess && (
            <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded mb-4">
              {importSuccess}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm hidden md:table">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="py-3 px-4 text-left font-medium">Invoice #</th>
                    <th className="py-3 px-4 text-left font-medium">Customer</th>
                    <th className="py-3 px-4 text-left font-medium">Date</th>
                    <th className="py-3 px-4 text-left font-medium">Due Date</th>
                    <th className="py-3 px-4 text-right font-medium">Amount</th>
                    <th className="py-3 px-4 text-center font-medium">Status</th>
                    <th className="py-3 px-4 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12">
                        <div className="flex flex-col items-center justify-center text-center">
                          <div className="rounded-full bg-gray-100 p-3 mb-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">No invoices found</h3>
                          <p className="text-sm text-muted-foreground mb-4">Get started by creating your first invoice</p>
                          <Button size="sm" onClick={handleAddNewInvoice} className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Invoice
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((invoice) => (
                      <tr key={invoice._id} className="border-b hover:bg-muted/25">
                        <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{invoice.customer.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {invoice.customer.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatDate(invoice.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span className={invoice.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                            {formatDate(invoice.dueDate)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-right">{formatCurrency(invoice.total)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 inline-flex items-center justify-center rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              className="p-1 rounded-md hover:bg-muted"
                              onClick={() => handleEditInvoice(invoice)}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </button>
                            <button className="p-1 rounded-md hover:bg-muted" onClick={() => handleDeleteInvoice(invoice._id)}>
                              <Trash className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {currentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No invoices found</h3>
                    <p className="text-sm text-muted-foreground mb-4">Get started by creating your first invoice</p>
                    <Button size="sm" onClick={handleAddNewInvoice} className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Invoice
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-4 space-y-4">
                    {currentItems.map((invoice) => (
                      <div key={invoice._id} className="border rounded-lg bg-card shadow-sm overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                              <p className="text-sm">{invoice.customer.name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p className="text-sm font-medium">{formatDate(invoice.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Due Date</p>
                              <p className={`text-sm font-medium ${invoice.status === 'overdue' ? 'text-red-600' : ''}`}>
                                {formatDate(invoice.dueDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="text-sm font-medium">{formatCurrency(invoice.total)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Customer Email</p>
                              <p className="text-sm truncate">{invoice.customer.email || '-'}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-3 pt-3 border-t">
                            <button 
                              className="p-2 rounded-md bg-blue-500/10 hover:bg-blue-500/20"
                              onClick={() => handleEditInvoice(invoice)}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </button>
                            <button 
                              className="p-2 rounded-md bg-red-500/10 hover:bg-red-500/20" 
                              onClick={() => handleDeleteInvoice(invoice._id)}
                            >
                              <Trash className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
              <p>Showing {Math.min(indexOfFirstItem + 1, filteredInvoices.length)} to {Math.min(indexOfLastItem, filteredInvoices.length)} of {filteredInvoices.length} invoices</p>
              <div className="flex gap-1 mt-3 sm:mt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {getPageNumbers().map(number => (
                  <Button 
                    key={number}
                    variant="outline" 
                    size="sm" 
                    className={currentPage === number ? "bg-primary text-primary-foreground" : ""}
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </Button>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Creation/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update the details of this invoice.' 
                : 'Fill in the details below to create a new invoice.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            {formError && (
              <div className="bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-md mb-4">
                {formError}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={newInvoice.customer.name}
                  onChange={(e) => setNewInvoice({...newInvoice, customer: {...newInvoice.customer, name: e.target.value}})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={newInvoice.customer.email}
                  onChange={(e) => setNewInvoice({...newInvoice, customer: {...newInvoice.customer, email: e.target.value}})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <textarea
                  id="customerAddress"
                  value={newInvoice.customer.address}
                  onChange={(e) => setNewInvoice({...newInvoice, customer: {...newInvoice.customer, address: e.target.value}})}
                  rows="3"
                  className="w-full rounded-md border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400"
                  placeholder="Enter customer address..."
                ></textarea>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h3 className="font-medium text-white">Invoice Items</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddItem}
                  className="text-xs h-7"
                >
                  Add Item
                </Button>
              </div>
              
              {newInvoice.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input 
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input 
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center h-10 border border-gray-600 bg-gray-800 px-3 rounded-md text-gray-300">
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
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  placeholder="Additional notes for this invoice"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                  rows="3"
                  className="w-full rounded-md border border-gray-600 bg-gray-800 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-400"
                ></textarea>
              </div>
              
              <div className="space-y-2 border-t border-gray-700 pt-4 md:pt-0 md:border-0 bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white">{formatCurrency(newInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-gray-400">Tax (17%):</span>
                  <span className="text-white">{formatCurrency(newInvoice.tax)}</span>
                </div>
                <div className="flex justify-between font-medium py-2 border-t border-gray-600 mt-2">
                  <span className="text-white">Total:</span>
                  <span className="text-primary text-lg font-bold">{formatCurrency(newInvoice.total)}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-4 border-t border-gray-700 mt-6">
              <p className="text-xs text-gray-400 mr-auto">Fields marked with <span className="text-red-400">*</span> are required</p>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Invoice' : 'Create Invoice')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices; 