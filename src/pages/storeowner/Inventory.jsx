import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { 
  getInventoryItems, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  addBatchToInventoryItem,
  clearCache
} from "../../lib/api";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

const StoreOwnerInventory = () => {
  const { selectedStore, isAuthenticated } = useAdminAuth();
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
        
        if (!selectedStore?._id) {
          setError('No store selected. Please select a store first.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching inventory for store:', selectedStore._id);
        // Make sure the storeId is included in the request
        const data = await getInventoryItems();
        
        if (isMounted) {
          if (!data || data.length === 0) {
            console.log('No inventory items returned from API');
            setInventoryItems([]);
          } else {
            console.log('Inventory data received:', data.length, 'items');
            setInventoryItems(data);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Inventory fetch error in component:', err);
          if (typeof err === 'string' && (err.includes('Not authorized') || err.includes('token'))) {
            setError('Authentication error. Please log out and log in again.');
          } else {
            setError(typeof err === 'string' ? err : 'Failed to fetch inventory items. Please try again later.');
          }
          setInventoryItems([]);
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
  }, [selectedStore]);

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
      
      if (!selectedStore?._id) {
        setError('No store selected');
        setLoading(false);
        return;
      }
      
      // Validate required fields
      if (!newItem.name || !newItem.sku || !newItem.category) {
        setError('Name, SKU, and Category are required fields');
        setLoading(false);
        return;
      }
      
      // Ensure the item is associated with the selected store
      const itemWithStore = {
        ...newItem,
        store: selectedStore._id
      };
      
      console.log('Submitting inventory item with store ID:', selectedStore._id);
      
      if (isEditMode) {
        // Update existing item
        await updateInventoryItem(currentItemId, itemWithStore, selectedStore._id);
        
        // Update the UI
        setInventoryItems(
          inventoryItems.map((item) => 
            item._id === currentItemId ? { ...item, ...newItem } : item
          )
        );
      } else {
        // Create new item
        const createdItem = await createInventoryItem(itemWithStore, selectedStore._id);
        
        // Add to UI
        setInventoryItems([...inventoryItems, createdItem]);
      }
      
      // Clear cache after successful operation
      clearCache('inventory', selectedStore._id);
      
      // Reset form and close modal
      resetForm();
      setIsAddModalOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error in handleSubmitInventoryItem:', err);
      
      // Set a more specific error message if available
      if (typeof err === 'string') {
        setError(err);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError('Failed to save inventory item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add batch to inventory item
  const handleAddBatch = async () => {
    if (!selectedProduct) return;
    
    try {
      setLoading(true);
      
      if (!selectedStore?._id) {
        setError('No store selected');
        setLoading(false);
        return;
      }
      
      // Add the batch to the selected product
      await addBatchToInventoryItem(selectedProduct._id, {
        ...batchDetails,
        store: selectedStore._id
      });
      
      // Update the UI with store-specific inventory data
      const updatedInventory = await getInventoryItems(selectedStore._id);
      setInventoryItems(updatedInventory);
      
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

  // Delete inventory item
  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        setLoading(true);
        
        // Delete the item via API with store ID
        await deleteInventoryItem(id, selectedStore?._id);
        
        // Update the UI
        setInventoryItems(inventoryItems.filter((item) => item._id !== id));
        
        // Clear cache after successful operation
        clearCache('inventory', selectedStore?._id);
        
        setError(null);
      } catch (err) {
        setError('Failed to delete inventory item. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Set up edit mode for an item
  const handleEditItem = (item) => {
    setIsEditMode(true);
    setCurrentItemId(item._id);
    
    // Populate the form with the item's data
    setNewItem({
      name: item.name,
      sku: item.sku || '',
      category: item.category || '',
      quantity: item.quantity || 0,
      unit: item.unit || '',
      price: item.price || 0,
      threshold: item.threshold || 10,
      status: item.status || 'In Stock',
      supplier: item.supplier || '',
      batches: item.batches || []
    });
    
    setIsAddModalOpen(true);
  };

  // Reset the form to default values
  const resetForm = () => {
    setIsEditMode(false);
    setCurrentItemId(null);
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
  };

  // View batches for a product
  const handleViewBatches = (product) => {
    setSelectedProduct(product);
    setActiveTab('batches');
  };

  // Open batch modal for adding batch to a product
  const openBatchModal = (product) => {
    setSelectedProduct(product);
    setIsBatchModalOpen(true);
  };

  // Handle sorting of inventory items
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Export inventory to CSV
  const handleExport = () => {
    // Filter items based on current filters
    const filteredItems = inventoryItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'low' && item.quantity < item.threshold) ||
                          (statusFilter === 'out' && item.quantity === 0) ||
                          (statusFilter === 'ok' && item.quantity >= item.threshold);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Sort the filtered items
    const sortedItems = [...filteredItems].sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'quantity') {
        return sortDirection === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      } else if (sortBy === 'price') {
        return sortDirection === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      }
      return 0;
    });
    
    // Create CSV content
    let csvContent = 'Name,SKU,Category,Quantity,Unit,Price,Threshold,Status,Supplier\n';
    
    sortedItems.forEach((item) => {
      const status = item.quantity === 0 
        ? 'Out of Stock' 
        : item.quantity < item.threshold 
          ? 'Low Stock' 
          : 'In Stock';
      
      csvContent += `${escapeCsvValue(item.name)},${escapeCsvValue(item.sku)},${escapeCsvValue(item.category)},${item.quantity},${escapeCsvValue(item.unit)},${item.price},${item.threshold},${status},${escapeCsvValue(item.supplier)}\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export detailed inventory with batch information to CSV
  const handleDetailedExport = () => {
    // Create CSV content with batch details
    let csvContent = 'Name,SKU,Category,Total Quantity,Unit,Price,Batch ID,Lot Number,Manufacturing Date,Expiry Date,Batch Quantity,Supplier,Location Code,Notes\n';
    
    inventoryItems.forEach((item) => {
      if (item.batches && item.batches.length > 0) {
        // For items with batches, create one row per batch
        item.batches.forEach((batch) => {
          csvContent += `${escapeCsvValue(item.name)},${escapeCsvValue(item.sku)},${escapeCsvValue(item.category)},${item.quantity},${escapeCsvValue(item.unit)},${item.price},${escapeCsvValue(batch.batchId)},${escapeCsvValue(batch.lotNumber)},${batch.manufacturingDate || ''},${batch.expiryDate || ''},${batch.quantity || 0},${escapeCsvValue(batch.supplier)},${escapeCsvValue(batch.locationCode)},${escapeCsvValue(batch.notes)}\n`;
        });
      } else {
        // For items without batches, create a single row
        csvContent += `${escapeCsvValue(item.name)},${escapeCsvValue(item.sku)},${escapeCsvValue(item.category)},${item.quantity},${escapeCsvValue(item.unit)},${item.price},,,,,,${escapeCsvValue(item.supplier)},,\n`;
      }
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_detailed_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Escape CSV values to handle commas and quotes
  const escapeCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    
    const stringValue = String(value);
    
    // If the value contains a comma, newline, or double quote, enclose it in double quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      // Replace any double quotes with two double quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  };

  // Filter and sort inventory items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                        (statusFilter === 'low' && item.quantity < item.threshold) ||
                        (statusFilter === 'out' && item.quantity === 0) ||
                        (statusFilter === 'ok' && item.quantity >= item.threshold);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get all unique categories from inventory items
  const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];

  // Sort the filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name?.localeCompare(b.name || '')
        : b.name?.localeCompare(a.name || '');
    } else if (sortBy === 'quantity') {
      return sortDirection === 'asc'
        ? (a.quantity || 0) - (b.quantity || 0)
        : (b.quantity || 0) - (a.quantity || 0);
    } else if (sortBy === 'price') {
      return sortDirection === 'asc'
        ? (a.price || 0) - (b.price || 0)
        : (b.price || 0) - (a.price || 0);
    }
    return 0;
  });

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold">Inventory Management</h2>
        <p className="text-muted-foreground">Track and manage your store's inventory levels.</p>
      </div>
      
      <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inventory">Inventory Items</TabsTrigger>
          <TabsTrigger value="batches" disabled={!selectedProduct}>
            {selectedProduct ? `Batches - ${selectedProduct.name}` : 'Batches'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inventory" className="space-y-4 pt-4">
          {/* Inventory controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-1 max-w-md relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inventory..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Category</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ok">In Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Inventory Item
              </Button>
            </div>
          </div>
          
          {/* Inventory table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading inventory...</p>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Error Loading Inventory</h3>
                  <p className="text-muted-foreground mt-2">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reload Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : inventoryItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Package className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Inventory Items Found</h3>
                <p className="text-muted-foreground mt-2">Add your first inventory item to get started.</p>
                <Button 
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Inventory Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="w-[30%] cursor-pointer"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center">
                            Product
                            {sortBy === 'name' && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead
                          className="text-right cursor-pointer"
                          onClick={() => handleSort('quantity')}
                        >
                          <div className="flex items-center justify-end">
                            Quantity
                            {sortBy === 'quantity' && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer"
                          onClick={() => handleSort('price')}
                        >
                          <div className="flex items-center justify-end">
                            Price
                            {sortBy === 'price' && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="font-medium">
                            <div>
                              {item.name}
                              {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                            </div>
                          </TableCell>
                          <TableCell>{item.category || '—'}</TableCell>
                          <TableCell className="text-right">
                            {item.quantity} {item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            {typeof item.price === 'number' 
                              ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PKR' }).format(item.price)
                              : '—'
                            }
                          </TableCell>
                          <TableCell>
                            {item.quantity === 0 ? (
                              <Badge variant="destructive" className="flex items-center w-fit">
                                <XCircle className="mr-1 h-3 w-3" />
                                Out of Stock
                              </Badge>
                            ) : item.quantity < item.threshold ? (
                              <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-100/80 flex items-center w-fit">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Low Stock
                              </Badge>
                            ) : (
                              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100/80 flex items-center w-fit">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                In Stock
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleViewBatches(item)}>
                                <Clipboard className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {sortedItems.length} of {inventoryItems.length} items
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDetailedExport}>
                      <Download className="mr-2 h-4 w-4" />
                      Detailed Export
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="batches" className="space-y-4 pt-4">
          {/* Batches tab content */}
          {selectedProduct && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{selectedProduct.name} - Batches</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setActiveTab('inventory')}>
                    Back to Inventory
                  </Button>
                  <Button onClick={() => openBatchModal(selectedProduct)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Batch
                  </Button>
                </div>
              </div>
              
              {selectedProduct.batches && selectedProduct.batches.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Batch ID</TableHead>
                          <TableHead>Lot Number</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProduct.batches.map((batch, index) => (
                          <TableRow key={batch._id || index}>
                            <TableCell className="font-medium">{batch.batchId}</TableCell>
                            <TableCell>{batch.lotNumber || '—'}</TableCell>
                            <TableCell>
                              {batch.expiryDate 
                                ? new Date(batch.expiryDate).toLocaleDateString()
                                : '—'
                              }
                            </TableCell>
                            <TableCell className="text-right">
                              {batch.quantity} {selectedProduct.unit}
                            </TableCell>
                            <TableCell>{batch.supplier || '—'}</TableCell>
                            <TableCell>{batch.locationCode || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-48">
                    <Clipboard className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Batches Found</h3>
                    <p className="text-muted-foreground mt-2">Add your first batch to track expiry dates and locations.</p>
                    <Button 
                      className="mt-4"
                      onClick={() => openBatchModal(selectedProduct)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Batch
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Inventory Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-emerald-700/30 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-emerald-400">{isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              {isEditMode 
                ? 'Update the details of the inventory item below.' 
                : 'Enter the details of the new inventory item below.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitInventoryItem} className="space-y-5 py-4">
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 px-3 py-2 rounded mb-3 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-gray-200">Item Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="sku" className="text-gray-200">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={newItem.sku}
                  onChange={handleInputChange}
                  placeholder="Unique product code"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="text-gray-200">Category *</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({...newItem, category: value})}
                  required
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="Pesticide">Pesticide</SelectItem>
                    <SelectItem value="Herbicide">Herbicide</SelectItem>
                    <SelectItem value="Fungicide">Fungicide</SelectItem>
                    <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity" className="text-gray-200">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  placeholder="Current stock level"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="unit" className="text-gray-200">Unit *</Label>
                <Select
                  value={newItem.unit}
                  onValueChange={(value) => setNewItem({...newItem, unit: value})}
                  required
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="Liter">Liter</SelectItem>
                    <SelectItem value="Kilogram">Kilogram</SelectItem>
                    <SelectItem value="Gram">Gram</SelectItem>
                    <SelectItem value="Package">Package</SelectItem>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                    <SelectItem value="Bag">Bag</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="price" className="text-gray-200">Price (PKR) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.price}
                  onChange={handleInputChange}
                  placeholder="Unit price"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="threshold" className="text-gray-200">Low Stock Threshold *</Label>
                <Input
                  id="threshold"
                  name="threshold"
                  type="number"
                  min="1"
                  value={newItem.threshold}
                  onChange={handleInputChange}
                  placeholder="Alert when stock is below"
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="supplier" className="text-gray-200">Supplier</Label>
                <Input
                  id="supplier"
                  name="supplier"
                  value={newItem.supplier}
                  onChange={handleInputChange}
                  placeholder="Main supplier name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="status" className="text-gray-200">Status</Label>
                <Select
                  value={newItem.status}
                  onValueChange={(value) => setNewItem({...newItem, status: value})}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="border-t border-gray-700 pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Saving...' : isEditMode ? 'Update Item' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Batch Modal */}
      <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-emerald-700/30 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-emerald-400">Add Batch</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              {selectedProduct 
                ? `Add a new batch for ${selectedProduct.name}.`
                : 'Add a new batch for this product.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => { e.preventDefault(); handleAddBatch(); }} className="space-y-5 py-4">
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 px-3 py-2 rounded mb-3 text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div>
                <Label htmlFor="batchId" className="text-gray-200">Batch ID *</Label>
                <Input
                  id="batchId"
                  name="batchId"
                  value={batchDetails.batchId}
                  onChange={handleBatchInputChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="lotNumber" className="text-gray-200">Lot Number</Label>
                <Input
                  id="lotNumber"
                  name="lotNumber"
                  value={batchDetails.lotNumber}
                  onChange={handleBatchInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="manufacturingDate" className="text-gray-200">Manufacturing Date</Label>
                <Input
                  id="manufacturingDate"
                  name="manufacturingDate"
                  type="date"
                  value={batchDetails.manufacturingDate}
                  onChange={handleBatchInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="expiryDate" className="text-gray-200">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="date"
                  value={batchDetails.expiryDate}
                  onChange={handleBatchInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="quantity" className="text-gray-200">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  value={batchDetails.quantity}
                  onChange={handleBatchInputChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="supplier" className="text-gray-200">Supplier</Label>
                <Input
                  id="supplier"
                  name="supplier"
                  value={batchDetails.supplier}
                  onChange={handleBatchInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="locationCode" className="text-gray-200">Location Code</Label>
                <Input
                  id="locationCode"
                  name="locationCode"
                  value={batchDetails.locationCode}
                  onChange={handleBatchInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="notes" className="text-gray-200">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={batchDetails.notes}
                  onChange={handleBatchInputChange}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            
            <DialogFooter className="border-t border-gray-700 pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsBatchModalOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Adding...' : 'Add Batch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreOwnerInventory; 