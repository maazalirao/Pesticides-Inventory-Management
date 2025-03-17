import React, { useState } from 'react';
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

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('invoices');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer: '',
    customerType: 'Business',
    dueDate: '',
    items: [{ product: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for invoices
  const invoices = [
    {
      id: "INV-2023-001",
      customer: "Al-Barakat Farms",
      customerType: "Business",
      date: "2023-11-15",
      dueDate: "2023-12-15",
      amount: 125075,
      status: "Paid",
      items: [
        { id: 1, product: "MaxKill Insecticide", quantity: 5, unitPrice: 4999, total: 24995 },
        { id: 2, product: "HerbControl Plus", quantity: 12, unitPrice: 3850, total: 46200 },
        { id: 3, product: "AntControl", quantity: 15, unitPrice: 1999, total: 29985 },
        { id: 4, product: "FungoClear Solution", quantity: 3, unitPrice: 6500, total: 19500 }
      ]
    },
    {
      id: "INV-2023-002",
      customer: "City Parks Authority",
      customerType: "Government",
      date: "2023-11-20",
      dueDate: "2023-12-20",
      amount: 375225,
      status: "Paid",
      items: [
        { id: 1, product: "WeedBGone", quantity: 30, unitPrice: 2799, total: 83970 },
        { id: 2, product: "MaxKill Insecticide", quantity: 40, unitPrice: 4999, total: 199960 },
        { id: 3, product: "RatAway Pellets", quantity: 25, unitPrice: 2999, total: 74975 }
      ]
    },
    {
      id: "INV-2023-003",
      customer: "Rehman Orchards",
      customerType: "Business",
      date: "2023-11-28",
      dueDate: "2023-12-28",
      amount: 98050,
      status: "Pending",
      items: [
        { id: 1, product: "FungoClear Solution", quantity: 8, unitPrice: 6500, total: 52000 },
        { id: 2, product: "AntControl", quantity: 10, unitPrice: 1999, total: 19990 },
        { id: 3, product: "MaxKill Insecticide", quantity: 5, unitPrice: 4999, total: 24995 }
      ]
    },
    {
      id: "INV-2023-004",
      customer: "Maaz Ali",
      customerType: "Individual",
      date: "2023-12-05",
      dueDate: "2024-01-05",
      amount: 12598,
      status: "Overdue",
      items: [
        { id: 1, product: "AntControl", quantity: 2, unitPrice: 1999, total: 3998 },
        { id: 2, product: "WeedBGone", quantity: 3, unitPrice: 2799, total: 8397 }
      ]
    },
    {
      id: "INV-2023-005",
      customer: "Agriculture University",
      customerType: "Educational",
      date: "2023-12-10",
      dueDate: "2024-01-10",
      amount: 156075,
      status: "Pending",
      items: [
        { id: 1, product: "MaxKill Insecticide", quantity: 10, unitPrice: 4999, total: 49990 },
        { id: 2, product: "FungoClear Solution", quantity: 8, unitPrice: 6500, total: 52000 },
        { id: 3, product: "HerbControl Plus", quantity: 14, unitPrice: 3850, total: 53900 }
      ]
    },
    {
      id: "INV-2023-006",
      customer: "Green Pakistan Services",
      customerType: "Business",
      date: "2023-12-15",
      dueDate: "2024-01-15",
      amount: 285025,
      status: "Pending",
      items: [
        { id: 1, product: "TermiteShield", quantity: 12, unitPrice: 8999, total: 107988 },
        { id: 2, product: "MoldBuster", quantity: 15, unitPrice: 4550, total: 68250 },
        { id: 3, product: "HerbControl Plus", quantity: 28, unitPrice: 3850, total: 107800 }
      ]
    }
  ];

  // Mock data for bills
  const bills = [
    {
      id: "BILL-2023-001",
      supplier: "Al-Faisal Chemicals",
      date: "2023-11-10",
      dueDate: "2023-12-10",
      amount: 568050,
      status: "Paid",
      items: [
        { id: 1, product: "MaxKill Insecticide (Bulk)", quantity: 50, unitPrice: 4250, total: 212500 },
        { id: 2, product: "AntiPest Powder (Bulk)", quantity: 80, unitPrice: 3680, total: 294400 },
        { id: 3, product: "Packaging Materials", quantity: 1, unitPrice: 61150, total: 61150 }
      ]
    },
    {
      id: "BILL-2023-002",
      supplier: "Malik Agro Solutions",
      date: "2023-11-18",
      dueDate: "2023-12-18",
      amount: 425075,
      status: "Paid",
      items: [
        { id: 1, product: "HerbControl Plus (Bulk)", quantity: 40, unitPrice: 3225, total: 129000 },
        { id: 2, product: "WeedBGone (Bulk)", quantity: 60, unitPrice: 2385, total: 143100 },
        { id: 3, product: "Spray Equipment", quantity: 5, unitPrice: 30595, total: 152975 }
      ]
    },
    {
      id: "BILL-2023-003",
      supplier: "Khan Agricultural Products",
      date: "2023-11-25",
      dueDate: "2023-12-25",
      amount: 378050,
      status: "Pending",
      items: [
        { id: 1, product: "FungoClear Solution (Bulk)", quantity: 30, unitPrice: 5850, total: 175500 },
        { id: 2, product: "MoldBuster (Bulk)", quantity: 35, unitPrice: 3895, total: 136325 },
        { id: 3, product: "Laboratory Testing", quantity: 1, unitPrice: 66225, total: 66225 }
      ]
    },
    {
      id: "BILL-2023-004",
      supplier: "Ahsan Brothers Trading",
      date: "2023-12-05",
      dueDate: "2024-01-05",
      amount: 378525,
      status: "Overdue",
      items: [
        { id: 1, product: "RatAway Pellets (Bulk)", quantity: 45, unitPrice: 2485, total: 111825 },
        { id: 2, product: "AntControl (Bulk)", quantity: 60, unitPrice: 1695, total: 101700 },
        { id: 3, product: "Safety Equipment", quantity: 10, unitPrice: 16500, total: 165000 }
      ]
    },
    {
      id: "BILL-2023-005",
      supplier: "Rashid Pest Control Supplies",
      date: "2023-12-12",
      dueDate: "2024-01-12",
      amount: 725000,
      status: "Pending",
      items: [
        { id: 1, product: "TermiteShield (Bulk)", quantity: 40, unitPrice: 7650, total: 306000 },
        { id: 2, product: "Insect Traps (Bulk)", quantity: 100, unitPrice: 1250, total: 125000 },
        { id: 3, product: "Application Equipment", quantity: 8, unitPrice: 36750, total: 294000 }
      ]
    }
  ];

  // Filter based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    return (
      (searchTerm === '' || 
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'All' || invoice.status === filterStatus)
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
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
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
    return format(new Date(dateString), 'MMM dd, yyyy');
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
      items: [...newInvoice.items, { product: '', quantity: 1, unitPrice: 0, total: 0 }]
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
  
  // Handle invoice submission
  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!newInvoice.customer || !newInvoice.dueDate) {
        setFormError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }
      
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            name: newInvoice.customer,
            email: newInvoice.email || 'customer@example.com', // You may want to add an email field
            address: newInvoice.address || 'Customer Address' // You may want to add an address field
          },
          items: newInvoice.items,
          subtotal: newInvoice.subtotal,
          tax: newInvoice.tax,
          total: newInvoice.total,
          dueDate: newInvoice.dueDate,
          notes: newInvoice.notes,
          status: 'draft'
        }),
      });
      
      if (response.ok) {
        // Reset form and close dialog
        setNewInvoice({
          customer: '',
          customerType: 'Business',
          dueDate: '',
          items: [{ product: '', quantity: 1, unitPrice: 0, total: 0 }],
          subtotal: 0,
          tax: 0,
          total: 0,
          notes: ''
        });
        setIsDialogOpen(false);
        // You might want to refresh the invoices list here
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setFormError(error.toString());
    } finally {
      setIsSubmitting(false);
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
              onClick={() => activeTab === 'invoices' ? setIsDialogOpen(true) : null}
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'invoices' ? 'Create New Invoice' : 'Add New Bill'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-xl font-bold text-primary">
                Create New Invoice
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm mt-1">
                Fill in the details below to create a new invoice.
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
                  <label htmlFor="customer" className="text-sm font-semibold text-gray-200 flex items-center">
                    Customer Name <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="customer"
                    name="customer"
                    value={newInvoice.customer}
                    onChange={(e) => setNewInvoice({...newInvoice, customer: e.target.value})}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="customerType" className="text-sm font-semibold text-gray-200 flex items-center">
                    Customer Type
                  </label>
                  <select 
                    id="customerType"
                    name="customerType"
                    value={newInvoice.customerType}
                    onChange={(e) => setNewInvoice({...newInvoice, customerType: e.target.value})}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Business">Business</option>
                    <option value="Individual">Individual</option>
                    <option value="Government">Government</option>
                    <option value="Educational">Educational</option>
                  </select>
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
                        placeholder="Product name"
                        value={item.product}
                        onChange={(e) => handleItemChange(index, 'product', e.target.value)}
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
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
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
                {(activeTab === 'invoices' ? filteredInvoices : filteredBills).map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/25">
                    <td className="py-3 px-2 sm:px-4 font-medium">{item.id}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <div>
                        <p className="truncate max-w-[100px] sm:max-w-[150px]">{activeTab === 'invoices' ? item.customer : item.supplier}</p>
                        {activeTab === 'invoices' && (
                          <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[150px]">{item.customerType}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">{formatDate(item.date)}</td>
                    <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                      <span className={item.status === 'Overdue' ? 'text-red-600 font-medium' : ''}>
                        {formatDate(item.dueDate)}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4 font-medium text-right">{formatCurrency(item.amount)}</td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      <span className={`px-2 py-1 inline-flex items-center justify-center rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
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

          {(activeTab === 'invoices' ? filteredInvoices : filteredBills).length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No {activeTab === 'invoices' ? 'invoices' : 'bills'} found
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {(activeTab === 'invoices' ? filteredInvoices : filteredBills).length} of {activeTab === 'invoices' ? invoices.length : bills.length} {activeTab}
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