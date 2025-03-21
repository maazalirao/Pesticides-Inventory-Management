import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  Package, 
  AlertTriangle, 
  Clipboard, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Download, 
  RefreshCw, 
  Calendar,
  BarChart4
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  getInventoryItems, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  addBatchToInventoryItem,
  clearCache
} from '../lib/api';

const Inventory = () => {
  // State for inventory filters and modals
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const [batchDetails, setBatchDetails] = useState({
    batchId: '',
    lotNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    quantity: '',
    supplier: '',
    locationCode: '',
    notes: ''
  });

  // State for API data
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    unit: '',
    price: 0,
      threshold: 10,
    status: 'In Stock',
    supplier: '',
    batches: []
  });

  // Fetch inventory items on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchInventoryItems = async () => {
      try {
        setLoading(true);
        const data = await getInventoryItems();
        
        if (isMounted) {
          setInventoryItems(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Inventory fetch error in component:', err);
          if (err.includes('Not authorized') || err.includes('token')) {
            setError('Authentication error. Please log out and log in again.');
          } else {
            setError('Failed to fetch inventory items. Please try again later.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchInventoryItems();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({
      ...newItem,
      [name]: name === 'price' || name === 'quantity' || name === 'threshold' 
        ? parseFloat(value) || 0 
        : value
    });
  };

  // Handle batch form input changes
  const handleBatchInputChange = (e) => {
    const { name, value } = e.target;
    setBatchDetails({
      ...batchDetails,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value
    });
  };

  // Add or edit inventory item
  const handleSubmitInventoryItem = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (isEditMode) {
        // Update existing item
        await updateInventoryItem(currentItemId, newItem);
        
        // Update the UI
        setInventoryItems(
          inventoryItems.map((item) => 
            item._id === currentItemId ? { ...item, ...newItem } : item
          )
        );
      } else {
        // Create new item
        const createdItem = await createInventoryItem(newItem);
        
        // Add to UI
        setInventoryItems([...inventoryItems, createdItem]);
      }
      
      // Clear cache after successful operation
      clearCache('inventory');
      
      // Reset form and close modal
      resetForm();
      setIsAddModalOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to save inventory item. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add batch to inventory item
  const handleAddBatch = async () => {
    if (!selectedProduct) return;
    
    try {
      setLoading(true);
      
      // Add batch via API
      const updatedItem = await addBatchToInventoryItem(selectedProduct._id, batchDetails);
      
      // Update UI
      setInventoryItems(
        inventoryItems.map((item) => 
          item._id === selectedProduct._id ? updatedItem : item
        )
      );
      
      // Reset form and close modal
      setBatchDetails({
        batchId: '',
        lotNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        quantity: '',
        supplier: '',
        locationCode: '',
        notes: ''
      });
      setIsBatchModalOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to add batch. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete item
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        setLoading(true);
        
        // Delete via API
        await deleteInventoryItem(id);
        
        // Update UI
        setInventoryItems(inventoryItems.filter(item => item._id !== id));
        
        // Clear cache after successful deletion
        clearCache('inventory');
        
        setError(null);
      } catch (err) {
        setError('Failed to delete inventory item. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle edit item
  const handleEditItem = (item) => {
    setIsEditMode(true);
    setCurrentItemId(item._id);
    setNewItem({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      threshold: item.threshold,
      status: item.status,
      supplier: item.supplier || '',
      batches: item.batches || []
    });
    setIsAddModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setNewItem({
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      unit: '',
      price: 0,
      threshold: 10,
      status: 'In Stock',
      supplier: '',
      batches: []
    });
    setIsEditMode(false);
    setCurrentItemId(null);
  };

  // Handle view batches
  const handleViewBatches = (product) => {
    setSelectedProduct(product);
    setActiveTab('batches');
  };

  // Open batch modal
  const openBatchModal = (product) => {
    setSelectedProduct(product);
    setIsBatchModalOpen(true);
  };

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handle export inventory data
  const handleExport = () => {
    try {
      // Define CSV headers for regular inventory
      const headers = [
        'Name', 'SKU', 'Category', 'Quantity', 'Unit', 
        'Price', 'Threshold', 'Status', 'Supplier'
      ];
      
      // Convert inventory items to CSV format
      const csvData = inventoryItems.map(item => [
        escapeCsvValue(item.name),
        escapeCsvValue(item.sku),
        escapeCsvValue(item.category),
        item.quantity,
        escapeCsvValue(item.unit),
        item.price,
        item.threshold,
        escapeCsvValue(item.status),
        escapeCsvValue(item.supplier)
      ]);
      
      // Add headers to the beginning
      csvData.unshift(headers);
      
      // Convert array to CSV string
      const csvString = csvData.map(row => row.join(',')).join('\n');
      
      // Create blob and download link
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Set link properties
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      
      // Append to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export inventory data. Please try again.');
      console.error(err);
    }
  };

  // Handle detailed export including batches
  const handleDetailedExport = () => {
    try {
      let csvRows = [];
      
      // Add header row
      csvRows.push([
        'Product Name', 'SKU', 'Category', 'Total Quantity', 'Unit', 'Price', 'Status',
        'Batch ID', 'Lot Number', 'Batch Quantity', 'Manufacturing Date', 'Expiry Date',
        'Supplier', 'Location Code', 'Notes'
      ].join(','));
      
      // Process each inventory item and its batches
      inventoryItems.forEach(item => {
        if (item.batches && item.batches.length > 0) {
          // Add rows for each batch
          item.batches.forEach(batch => {
            // Format dates safely
            const manufacturingDate = batch.manufacturingDate 
              ? new Date(batch.manufacturingDate).toISOString().split('T')[0] 
              : '';
            
            const expiryDate = batch.expiryDate 
              ? new Date(batch.expiryDate).toISOString().split('T')[0] 
              : '';
            
            const row = [
              escapeCsvValue(item.name),
              escapeCsvValue(item.sku),
              escapeCsvValue(item.category),
              item.quantity,
              escapeCsvValue(item.unit),
              item.price,
              escapeCsvValue(item.status),
              escapeCsvValue(batch.batchId),
              escapeCsvValue(batch.lotNumber),
              batch.quantity,
              manufacturingDate,
              expiryDate,
              escapeCsvValue(batch.supplier || item.supplier),
              escapeCsvValue(batch.locationCode),
              escapeCsvValue(batch.notes)
            ];
            csvRows.push(row.join(','));
          });
        } else {
          // Add a row for items without batches
          const row = [
            escapeCsvValue(item.name),
            escapeCsvValue(item.sku),
            escapeCsvValue(item.category),
            item.quantity,
            escapeCsvValue(item.unit),
            item.price,
            escapeCsvValue(item.status),
            '', '', '', '', '', escapeCsvValue(item.supplier), '', ''
          ];
          csvRows.push(row.join(','));
        }
      });
      
      // Convert to CSV string
      const csvString = csvRows.join('\n');
      
      // Create blob and download link
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      // Set link properties
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_detailed_export_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      
      // Append to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export detailed inventory data. Please try again.');
      console.error(err);
    }
  };

  // Helper function to escape CSV values properly
  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    
    // Convert to string and check if it needs quoting
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      // Escape double quotes by doubling them and wrap in quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Filter inventory items based on search query and filters
  const filteredItems = inventoryItems.filter(item => {
    // Search query filter
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || item.category.toLowerCase() === categoryFilter.toLowerCase();
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle numeric sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  // Calculate total items and batches
  const totalItems = inventoryItems.length;
  const totalBatches = inventoryItems.reduce((total, item) => total + item.batches.length, 0);
  const totalQuantity = inventoryItems.reduce((total, item) => total + item.quantity, 0);
  const lowStockItems = inventoryItems.filter(item => item.status === "Low Stock").length;
  const outOfStockItems = inventoryItems.filter(item => item.status === "Out of Stock").length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage your product inventory and batch information.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Export Inventory Data</DialogTitle>
                <DialogDescription>
                  Choose the type of export you want to generate.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Button onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" /> Standard Export
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Basic inventory information without batch details.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button onClick={handleDetailedExport}>
                    <Download className="mr-2 h-4 w-4" /> Detailed Export
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive export with batch details and tracking information.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Display error message if there is one */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Package className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <h2 className="text-2xl font-bold">{totalItems}</h2>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clipboard className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Total Batches</p>
            <h2 className="text-2xl font-bold">{totalBatches}</h2>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <BarChart4 className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Total Units</p>
            <h2 className="text-2xl font-bold">{totalQuantity}</h2>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
            <h2 className="text-2xl font-bold">{lowStockItems}</h2>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
            <h2 className="text-2xl font-bold">{outOfStockItems}</h2>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="inventory" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="batches">Batch Tracking</TabsTrigger>
          <TabsTrigger value="locations">Warehouse Locations</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <SelectValue placeholder="Category" className="text-gray-500 dark:text-gray-400" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 [&_[data-radix-select-item-indicator]]:text-gray-900 dark:[&_[data-radix-select-item-indicator]]:text-gray-200">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">All Categories</SelectItem>
                <SelectItem value="insecticide" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Insecticide</SelectItem>
                <SelectItem value="herbicide" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Herbicide</SelectItem>
                <SelectItem value="fungicide" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Fungicide</SelectItem>
                <SelectItem value="rodenticide" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Rodenticide</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <SelectValue placeholder="Status" className="text-gray-500 dark:text-gray-400" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 [&_[data-radix-select-item-indicator]]:text-gray-900 dark:[&_[data-radix-select-item-indicator]]:text-gray-200">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">All Status</SelectItem>
                <SelectItem value="in stock" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">In Stock</SelectItem>
                <SelectItem value="low stock" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Low Stock</SelectItem>
                <SelectItem value="out of stock" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading inventory...</span>
                </div>
              ) : (
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm hidden md:table">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="py-3 px-4 text-left font-medium w-[80px]">SKU</th>
                      <th className="py-3 px-4 text-left font-medium cursor-pointer" onClick={() => handleSort('name')}>
                        <div className="flex items-center">
                          Product Name
                          {sortBy === 'name' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left font-medium cursor-pointer" onClick={() => handleSort('category')}>
                        <div className="flex items-center">
                          Category
                          {sortBy === 'category' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right font-medium cursor-pointer" onClick={() => handleSort('quantity')}>
                        <div className="flex items-center justify-end">
                          Quantity
                          {sortBy === 'quantity' && (
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="py-3 px-4 text-right font-medium">Unit</th>
                      <th className="py-3 px-4 text-right font-medium">Price</th>
                      <th className="py-3 px-4 text-left font-medium">Status</th>
                      <th className="py-3 px-4 text-left font-medium">Batches</th>
                      <th className="py-3 px-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-muted-foreground">
                          No inventory items found. Add some items to get started.
                        </td>
                      </tr>
                    ) : (
                      sortedItems.map((item) => (
                        <tr key={item._id} className="border-b hover:bg-muted/25">
                          <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{item.sku}</td>
                          <td className="py-3 px-4 font-medium">{item.name}</td>
                          <td className="py-3 px-4">{item.category}</td>
                          <td className="py-3 px-4 text-right font-medium">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">{item.unit}</td>
                          <td className="py-3 px-4 text-right font-medium">₹{item.price.toFixed(2)}</td>
                          <td className="py-3 px-4 flex justify-center">
                            <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium border text-black dark:text-white ${
                              item.status === 'Low Stock' 
                                ? 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-800/50'
                                : item.status === 'Out of Stock' 
                                  ? 'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-800/50'
                                  : 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-800/50'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewBatches(item)}
                              className="font-medium"
                            >
                              {item.batches?.length || 0} Batches
                            </Button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <button 
                                className="p-1 rounded-md hover:bg-muted"
                                onClick={() => openBatchModal(item)}
                              >
                                <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </button>
                              <button 
                                className="p-1 rounded-md hover:bg-muted"
                                onClick={() => handleEditItem(item)}
                              >
                                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </button>
                              <button 
                                className="p-1 rounded-md hover:bg-muted"
                                onClick={() => handleDeleteItem(item._id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Mobile Card View */}
                <div className="md:hidden grid grid-cols-1 gap-4 p-4">
                  {sortedItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No inventory items found. Add some items to get started.
                    </div>
                  ) : (
                    sortedItems.map((item) => (
                      <div key={item._id} className="border rounded-md p-4 bg-card hover:bg-muted/25 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-xs text-muted-foreground mb-1">{item.sku}</p>
                          </div>
                          <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-medium border text-black dark:text-white ${
                            item.status === 'Low Stock' 
                              ? 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-800/50'
                              : item.status === 'Out of Stock' 
                                ? 'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-800/50'
                                : 'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-800/50'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 my-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Category</p>
                            <p className="text-sm">{item.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="text-sm font-medium">₹{item.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Quantity</p>
                            <p className="text-sm font-medium">{item.quantity} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Batches</p>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewBatches(item)}
                              className="font-medium p-0 h-auto"
                            >
                              {item.batches?.length || 0} Batches
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-2 border-t pt-3">
                          <button 
                            className="p-1.5 rounded-md hover:bg-muted"
                            onClick={() => openBatchModal(item)}
                          >
                            <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </button>
                          <button 
                            className="p-1.5 rounded-md hover:bg-muted"
                            onClick={() => handleEditItem(item)}
                          >
                            <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button 
                            className="p-1.5 rounded-md hover:bg-muted"
                            onClick={() => handleDeleteItem(item._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Batch Tracking</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Track all batches and lot numbers across your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="py-3 px-4 text-left font-medium">Batch ID</th>
                      <th className="py-3 px-4 text-left font-medium">Lot Number</th>
                      <th className="py-3 px-4 text-left font-medium">Product</th>
                      <th className="py-3 px-4 text-left font-medium">Quantity</th>
                      <th className="py-3 px-4 text-left font-medium">Manufacturing Date</th>
                      <th className="py-3 px-4 text-left font-medium">Expiry Date</th>
                      <th className="py-3 px-4 text-left font-medium">Supplier</th>
                      <th className="py-3 px-4 text-left font-medium">Location</th>
                      <th className="py-3 px-4 text-center font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-muted-foreground">
                          No batches available. Add inventory items with batches to get started.
                        </td>
                      </tr>
                    ) : inventoryItems.flatMap(item => item.batches || []).length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-4 text-muted-foreground">
                          No batches found. Add batches to your inventory items.
                        </td>
                      </tr>
                    ) : (
                      inventoryItems.flatMap(item => 
                        (item.batches || []).map(batch => (
                          <tr key={`${item._id}-${batch.batchId}`} className="border-b hover:bg-muted/25">
                            <td className="py-3 px-4 font-medium">{batch.batchId}</td>
                            <td className="py-3 px-4">{batch.lotNumber}</td>
                            <td className="py-3 px-4">{item.name}</td>
                            <td className="py-3 px-4 font-medium">{batch.quantity} {item.unit}</td>
                            <td className="py-3 px-4">{new Date(batch.manufacturingDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-medium">{new Date(batch.expiryDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4">{batch.supplier || item.supplier || '-'}</td>
                            <td className="py-3 px-4 font-mono text-xs">{batch.locationCode}</td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center gap-2">
                                <button className="p-1 rounded-md hover:bg-muted">
                                  <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </button>
                                <button className="p-1 rounded-md hover:bg-muted">
                                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Locations</CardTitle>
              <CardDescription>
                Map of warehouse with product locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Warehouse 1</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p><span className="font-medium">Sections:</span> A, B, C</p>
                    <p><span className="font-medium">Products:</span> 38</p>
                    <p><span className="font-medium">Batches:</span> 45</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Warehouse 2</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p><span className="font-medium">Sections:</span> A, B, C</p>
                    <p><span className="font-medium">Products:</span> 25</p>
                    <p><span className="font-medium">Batches:</span> 32</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Warehouse 3</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p><span className="font-medium">Sections:</span> A, B, C</p>
                    <p><span className="font-medium">Products:</span> 18</p>
                    <p><span className="font-medium">Batches:</span> 24</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 border rounded-md p-4">
                <h3 className="font-medium mb-2">Location Codes Legend</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>W1 = Warehouse 1</div>
                  <div>W2 = Warehouse 2</div>
                  <div>W3 = Warehouse 3</div>
                  <div>A1-C4 = Section-Row</div>
                  <div>S1-S5 = Shelf Number</div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Example: W1-A3-S2 = Warehouse 1, Section A, Row 3, Shelf 2</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Inventory Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">{isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {isEditMode 
                ? 'Update the details of this inventory item' 
                : 'Add a new item to your inventory system'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitInventoryItem} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  Item Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter item name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="sku" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  SKU <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="Enter SKU code"
                  value={newItem.sku}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  Category <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select 
                  name="category" 
                  value={newItem.category} 
                  onValueChange={(value) => setNewItem({...newItem, category: value})}
                  required
                >
                  <SelectTrigger className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Select category" className="text-gray-500 dark:text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 [&_[data-radix-select-item-indicator]]:text-gray-900 dark:[&_[data-radix-select-item-indicator]]:text-gray-200">
                    <SelectItem value="Insecticide" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Insecticide</SelectItem>
                    <SelectItem value="Herbicide" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Herbicide</SelectItem>
                    <SelectItem value="Fungicide" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Fungicide</SelectItem>
                    <SelectItem value="Rodenticide" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Rodenticide</SelectItem>
                    <SelectItem value="Other" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  Price (₹) <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  Quantity <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  placeholder="Enter quantity"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="unit" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  Unit <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select 
                  name="unit" 
                  value={newItem.unit} 
                  onValueChange={(value) => setNewItem({...newItem, unit: value})}
                  required
                >
                  <SelectTrigger className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Select unit" className="text-gray-500 dark:text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 [&_[data-radix-select-item-indicator]]:text-gray-900 dark:[&_[data-radix-select-item-indicator]]:text-gray-200">
                    <SelectItem value="Bottles" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Bottles</SelectItem>
                    <SelectItem value="Cans" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Cans</SelectItem>
                    <SelectItem value="Boxes" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Boxes</SelectItem>
                    <SelectItem value="Bags" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Bags</SelectItem>
                    <SelectItem value="Packets" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Packets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="threshold" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  Low Stock Threshold <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="threshold"
                  name="threshold"
                  type="number"
                  min="0"
                  placeholder="Enter threshold"
                  value={newItem.threshold}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="supplier" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  Supplier
                </Label>
                <Input
                  id="supplier"
                  name="supplier"
                  placeholder="Enter supplier name"
                  value={newItem.supplier || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                  Status <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select 
                  name="status" 
                  value={newItem.status} 
                  onValueChange={(value) => setNewItem({...newItem, status: value})}
                  required
                >
                  <SelectTrigger className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Select status" className="text-gray-500 dark:text-gray-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 [&_[data-radix-select-item-indicator]]:text-gray-900 dark:[&_[data-radix-select-item-indicator]]:text-gray-200">
                    <SelectItem value="In Stock" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">In Stock</SelectItem>
                    <SelectItem value="Low Stock" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock" className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 active:bg-gray-100 dark:active:bg-gray-700 active:text-gray-900 dark:active:text-gray-200 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-200 data-[highlighted]:bg-gray-100 dark:data-[highlighted]:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="mt-5 sm:mt-6">
              <Button type="button" variant="outline" 
                className="border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
                onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}
                className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : isEditMode ? 'Update Item' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Details Modal */}
      <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Batch Management: {selectedProduct?.name}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              View and manage batch details for this product
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="view" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">View Batches</TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">Add New Batch</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="space-y-4">
              {selectedProduct?.batches?.length > 0 ? (
                <ScrollArea className="h-[350px] border border-gray-200 dark:border-gray-700 rounded-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="py-3 px-4 text-left font-medium">Batch ID</th>
                          <th className="py-3 px-4 text-left font-medium">Lot Number</th>
                          <th className="py-3 px-4 text-left font-medium">Quantity</th>
                          <th className="py-3 px-4 text-left font-medium">Manufacturing Date</th>
                          <th className="py-3 px-4 text-left font-medium">Expiry Date</th>
                          <th className="py-3 px-4 text-left font-medium">Supplier</th>
                          <th className="py-3 px-4 text-left font-medium">Location</th>
                          <th className="py-3 px-4 text-left font-medium">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProduct?.batches.map((batch) => (
                          <tr key={batch.batchId} className="border-b hover:bg-muted/25">
                            <td className="py-3 px-4 font-medium">{batch.batchId}</td>
                            <td className="py-3 px-4">{batch.lotNumber}</td>
                            <td className="py-3 px-4 font-medium">{batch.quantity} {selectedProduct?.unit}</td>
                            <td className="py-3 px-4">{new Date(batch.manufacturingDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-medium">{new Date(batch.expiryDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4">{batch.supplier || selectedProduct?.supplier || '-'}</td>
                            <td className="py-3 px-4 font-mono text-xs">{batch.locationCode}</td>
                            <td className="py-3 px-4 text-muted-foreground">{batch.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400">No batches found for this item</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchId" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      Batch ID <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="batchId"
                      name="batchId"
                      placeholder="Enter batch ID"
                      value={batchDetails.batchId}
                      onChange={handleBatchInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lotNumber" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      Lot Number <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="lotNumber"
                      name="lotNumber"
                      placeholder="Enter lot number"
                      value={batchDetails.lotNumber}
                      onChange={handleBatchInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      Quantity <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={batchDetails.quantity}
                      onChange={handleBatchInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supplier" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      Supplier <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="supplier"
                      name="supplier"
                      placeholder="Enter supplier name"
                      value={batchDetails.supplier}
                      onChange={handleBatchInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturingDate" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      Manufacturing Date <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="manufacturingDate"
                      name="manufacturingDate"
                      type="date"
                      value={batchDetails.manufacturingDate}
                      onChange={handleBatchInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      Expiry Date <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      value={batchDetails.expiryDate}
                      onChange={handleBatchInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="locationCode" className="text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center">
                      Location Code <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="locationCode"
                      name="locationCode"
                      placeholder="W1-A1-S1"
                      value={batchDetails.locationCode}
                      onChange={handleBatchInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-900 dark:text-gray-200">
                      Notes
                    </Label>
                    <Input
                      id="notes"
                      name="notes"
                      placeholder="Any additional notes"
                      value={batchDetails.notes}
                      onChange={handleBatchInputChange}
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" 
              className="border border-gray-300 dark:border-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              onClick={() => setIsBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={handleAddBatch} disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Saving...
                </>
              ) : 'Add Batch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory; 