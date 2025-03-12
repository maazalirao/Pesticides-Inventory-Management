import React, { useState } from 'react';
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

  // Mock data for inventory items with batch tracking
  const inventoryItems = [
    { 
      id: 1, 
      name: "MaxKill Insecticide",
      sku: "MK-INS-001",
      category: "Insecticide",
      quantity: 45,
      unit: "Bottles",
      price: 48.99,
      threshold: 10,
      status: "In Stock",
      batches: [
        {
          batchId: "B-MK-001",
          lotNumber: "L22-45678",
          quantity: 25,
          manufacturingDate: "2023-01-15",
          expiryDate: "2023-12-15",
          supplier: "AgriChem Inc.",
          locationCode: "W1-A3-S2",
          notes: "Original packaging"
        },
        {
          batchId: "B-MK-002",
          lotNumber: "L22-56789",
          quantity: 20,
          manufacturingDate: "2023-02-10",
          expiryDate: "2024-01-10",
          supplier: "AgriChem Inc.",
          locationCode: "W1-A3-S3",
          notes: "New formula"
        }
      ]
    },
    { 
      id: 2, 
      name: "HerbControl Plus",
      sku: "HC-HRB-002",
      category: "Herbicide",
      quantity: 28,
      unit: "Cans",
      price: 38.50,
      threshold: 15,
      status: "In Stock",
      batches: [
        {
          batchId: "B-HC-001",
          lotNumber: "L22-12345",
          quantity: 28,
          manufacturingDate: "2023-02-05",
          expiryDate: "2023-12-20",
          supplier: "GreenTech Solutions",
          locationCode: "W1-B2-S1",
          notes: "Premium formula"
        }
      ]
    },
    { 
      id: 3, 
      name: "FungoClear Solution",
      sku: "FC-FNG-003",
      category: "Fungicide",
      quantity: 16,
      unit: "Bottles",
      price: 65.00,
      threshold: 8,
      status: "In Stock",
      batches: [
        {
          batchId: "B-FC-001",
          lotNumber: "L22-23456",
          quantity: 10,
          manufacturingDate: "2023-01-20",
          expiryDate: "2023-12-28",
          supplier: "FarmChem Ltd",
          locationCode: "W1-C1-S4",
          notes: ""
        },
        {
          batchId: "B-FC-002",
          lotNumber: "L22-34567",
          quantity: 6,
          manufacturingDate: "2023-03-15",
          expiryDate: "2024-02-15",
          supplier: "FarmChem Ltd",
          locationCode: "W1-C1-S5",
          notes: "Concentrated formula"
        }
      ]
    },
    { 
      id: 4, 
      name: "RatAway Pellets",
      sku: "RA-ROD-004",
      category: "Rodenticide",
      quantity: 34,
      unit: "Boxes",
      price: 29.99,
      threshold: 20,
      status: "In Stock",
      batches: [
        {
          batchId: "B-RA-001",
          lotNumber: "L22-67890",
          quantity: 34,
          manufacturingDate: "2023-02-25",
          expiryDate: "2024-01-05",
          supplier: "PestControl Supplies",
          locationCode: "W2-A1-S3",
          notes: ""
        }
      ]
    },
    { 
      id: 5, 
      name: "AntiPest Powder",
      sku: "AP-INS-005",
      category: "Insecticide",
      quantity: 22,
      unit: "Bags",
      price: 42.50,
      threshold: 10,
      status: "In Stock",
      batches: [
        {
          batchId: "B-AP-001",
          lotNumber: "L22-78901",
          quantity: 22,
          manufacturingDate: "2023-03-10",
          expiryDate: "2024-01-10",
          supplier: "AgriChem Inc.",
          locationCode: "W2-B3-S1",
          notes: "All-purpose formula"
        }
      ]
    },
    { 
      id: 6, 
      name: "GardenGuard Spray",
      sku: "GG-INS-006",
      category: "Insecticide",
      quantity: 3,
      unit: "Cans",
      price: 36.75,
      threshold: 15,
      status: "Low Stock",
      batches: [
        {
          batchId: "B-GG-001",
          lotNumber: "L22-89012",
          quantity: 3,
          manufacturingDate: "2023-01-05",
          expiryDate: "2023-11-05",
          supplier: "GreenTech Solutions",
          locationCode: "W2-C2-S2",
          notes: "Expiring soon"
        }
      ]
    },
    { 
      id: 7, 
      name: "TermiteShield",
      sku: "TS-INS-007",
      category: "Insecticide",
      quantity: 2,
      unit: "Bottles",
      price: 89.99,
      threshold: 8,
      status: "Low Stock",
      batches: [
        {
          batchId: "B-TS-001",
          lotNumber: "L22-90123",
          quantity: 2,
          manufacturingDate: "2023-02-15",
          expiryDate: "2024-02-15",
          supplier: "PestControl Supplies",
          locationCode: "W3-A1-S1",
          notes: "Professional grade"
        }
      ]
    },
    { 
      id: 8, 
      name: "MosquitoKiller",
      sku: "MK-INS-008",
      category: "Insecticide",
      quantity: 4,
      unit: "Boxes",
      price: 24.95,
      threshold: 12,
      status: "Low Stock",
      batches: [
        {
          batchId: "B-MK-001",
          lotNumber: "L23-01234",
          quantity: 4,
          manufacturingDate: "2023-03-20",
          expiryDate: "2024-03-20",
          supplier: "FarmChem Ltd",
          locationCode: "W3-B2-S3",
          notes: "Water-resistant formula"
        }
      ]
    },
    { 
      id: 9, 
      name: "WeedBGone",
      sku: "WB-HRB-009",
      category: "Herbicide",
      quantity: 6,
      unit: "Bottles",
      price: 45.50,
      threshold: 10,
      status: "Low Stock",
      batches: [
        {
          batchId: "B-WB-001",
          lotNumber: "L23-12345",
          quantity: 6,
          manufacturingDate: "2023-04-05",
          expiryDate: "2024-04-05",
          supplier: "GreenTech Solutions",
          locationCode: "W3-C3-S4",
          notes: ""
        }
      ]
    },
    { 
      id: 10, 
      name: "CropShield Organic",
      sku: "CS-FNG-010",
      category: "Fungicide",
      quantity: 0,
      unit: "Bags",
      price: 52.25,
      threshold: 5,
      status: "Out of Stock",
      batches: []
    }
  ];

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

  // Handler for sort column click
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Handler for view batch details
  const handleViewBatches = (product) => {
    setSelectedProduct(product);
    setIsBatchModalOpen(true);
  };

  // Add a new batch for a product
  const handleAddBatch = () => {
    // In a real app, this would be an API call to add a batch to the database
    console.log("Adding batch:", batchDetails, "for product:", selectedProduct?.name);
    setIsBatchModalOpen(false);
    // Reset batch form
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
  };

  // Calculate total items and batches
  const totalItems = inventoryItems.length;
  const totalBatches = inventoryItems.reduce((total, item) => total + item.batches.length, 0);
  const totalQuantity = inventoryItems.reduce((total, item) => total + item.quantity, 0);
  const lowStockItems = inventoryItems.filter(item => item.status === "Low Stock").length;
  const outOfStockItems = inventoryItems.filter(item => item.status === "Out of Stock").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your pesticide products inventory with batch tracking
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="insecticide">Insecticide</SelectItem>
                <SelectItem value="herbicide">Herbicide</SelectItem>
                <SelectItem value="fungicide">Fungicide</SelectItem>
                <SelectItem value="rodenticide">Rodenticide</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in stock">In Stock</SelectItem>
                <SelectItem value="low stock">Low Stock</SelectItem>
                <SelectItem value="out of stock">Out of Stock</SelectItem>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">SKU</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        Product Name
                        {sortBy === 'name' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('category')}>
                      <div className="flex items-center">
                        Category
                        {sortBy === 'category' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right" onClick={() => handleSort('quantity')}>
                      <div className="flex items-center justify-end">
                        Quantity
                        {sortBy === 'quantity' && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Batches</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unit}</TableCell>
                      <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            item.status === "In Stock" 
                              ? "success" 
                              : item.status === "Low Stock" 
                                ? "warning" 
                                : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewBatches(item)}
                        >
                          View ({item.batches.length})
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Tracking</CardTitle>
              <CardDescription>
                Track all batches and lot numbers across your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Lot Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Manufacturing Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.flatMap(item => 
                    item.batches.map(batch => (
                      <TableRow key={`${item.id}-${batch.batchId}`}>
                        <TableCell className="font-medium">{batch.batchId}</TableCell>
                        <TableCell>{batch.lotNumber}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{batch.quantity} {item.unit}</TableCell>
                        <TableCell>{batch.manufacturingDate}</TableCell>
                        <TableCell>{batch.expiryDate}</TableCell>
                        <TableCell>{batch.locationCode}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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

      {/* Batch Details Modal */}
      <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Batch Management: {selectedProduct?.name}</DialogTitle>
            <DialogDescription>
              View and manage batch details for this product
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="view" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="view">View Batches</TabsTrigger>
              <TabsTrigger value="add">Add New Batch</TabsTrigger>
            </TabsList>
            
            <TabsContent value="view" className="space-y-4">
              {selectedProduct?.batches.length > 0 ? (
                <ScrollArea className="h-[350px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch ID</TableHead>
                        <TableHead>Lot Number</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Manufacturing Date</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProduct?.batches.map((batch, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{batch.batchId}</TableCell>
                          <TableCell>{batch.lotNumber}</TableCell>
                          <TableCell>{batch.quantity} {selectedProduct?.unit}</TableCell>
                          <TableCell>{batch.manufacturingDate}</TableCell>
                          <TableCell>{batch.expiryDate}</TableCell>
                          <TableCell>{batch.supplier}</TableCell>
                          <TableCell>{batch.locationCode}</TableCell>
                          <TableCell>{batch.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No batches found for this product</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="add" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="batchId">Batch ID</Label>
                    <Input
                      id="batchId"
                      placeholder="Enter batch ID"
                      value={batchDetails.batchId}
                      onChange={(e) => setBatchDetails({...batchDetails, batchId: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lotNumber">Lot Number</Label>
                    <Input
                      id="lotNumber"
                      placeholder="Enter lot number"
                      value={batchDetails.lotNumber}
                      onChange={(e) => setBatchDetails({...batchDetails, lotNumber: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      value={batchDetails.quantity}
                      onChange={(e) => setBatchDetails({...batchDetails, quantity: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      placeholder="Enter supplier name"
                      value={batchDetails.supplier}
                      onChange={(e) => setBatchDetails({...batchDetails, supplier: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="manufacturingDate">Manufacturing Date</Label>
                    <Input
                      id="manufacturingDate"
                      type="date"
                      value={batchDetails.manufacturingDate}
                      onChange={(e) => setBatchDetails({...batchDetails, manufacturingDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={batchDetails.expiryDate}
                      onChange={(e) => setBatchDetails({...batchDetails, expiryDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="locationCode">Location Code</Label>
                    <Input
                      id="locationCode"
                      placeholder="W1-A1-S1"
                      value={batchDetails.locationCode}
                      onChange={(e) => setBatchDetails({...batchDetails, locationCode: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      placeholder="Any additional notes"
                      value={batchDetails.notes}
                      onChange={(e) => setBatchDetails({...batchDetails, notes: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBatch}>
              Save Batch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal (placeholder) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input id="productName" placeholder="Enter product name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="Enter SKU" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="insecticide">Insecticide</SelectItem>
                    <SelectItem value="herbicide">Herbicide</SelectItem>
                    <SelectItem value="fungicide">Fungicide</SelectItem>
                    <SelectItem value="rodenticide">Rodenticide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Initial Quantity</Label>
                <Input id="quantity" type="number" placeholder="0" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory; 