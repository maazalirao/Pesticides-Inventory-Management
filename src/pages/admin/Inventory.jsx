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
  BarChart4,
  Store as StoreIcon
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
  getAllStoresInventory
} from "../../lib/api";

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

const Inventory = () => {
  // State for inventory filters and modals
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
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
  const [stores, setStores] = useState([]);
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

  // Simple pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Limit to 50 items per page

  // Fetch inventory items on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchInventoryItems = async () => {
      try {
        setLoading(true);
        console.log('Fetching limited inventory from all stores...');
        // Load only first 100 items for fast loading
        const data = await getAllStoresInventory(100);
        
        if (isMounted) {
          if (data) {
            console.log('Received limited data:', data);
            setInventoryItems(data.inventory || []);
            setStores(data.stores || []);
          } else {
            console.log('No data received from API');
            setInventoryItems([]);
            setStores([]);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Inventory fetch error in component:', err);
          setError('Failed to fetch inventory items. Please try again later.');
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
  }, []);

  // Add missing handleSort function
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Add missing export functions
  const handleExport = () => {
    // Basic export of filtered inventory
    console.log("Export inventory");
    alert("Export feature will be implemented soon");
  };

  const handleDetailedExport = () => {
    // Detailed export of inventory with batch info
    console.log("Detailed export inventory");
    alert("Detailed export feature will be implemented soon");
  };

  // Filter and sort inventory items with pagination
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                        (statusFilter === 'low' && item.quantity < item.threshold) ||
                        (statusFilter === 'out' && item.quantity === 0) ||
                        (statusFilter === 'ok' && item.quantity >= item.threshold);
    const matchesStore = storeFilter === 'all' || item.store?._id === storeFilter || item.storeId === storeFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStore;
  });

  // Get all unique categories from inventory items
  const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];

  // Sort and paginate the filtered items
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
    } else if (sortBy === 'store') {
      const storeNameA = a.store?.name || '';
      const storeNameB = b.store?.name || '';
      return sortDirection === 'asc'
        ? storeNameA.localeCompare(storeNameB)
        : storeNameB.localeCompare(storeNameA);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + itemsPerPage);

  // Get inventory statistics
  const totalInventoryItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter(item => item.quantity < item.threshold && item.quantity > 0).length;
  const outOfStockItems = inventoryItems.filter(item => item.status === "Out of Stock").length;
  const inStockItems = inventoryItems.filter(item => item.quantity >= item.threshold).length;

  const getStoreColor = (store) => {
    if (!store || !store.name) return 'gray';
    
    const storeColors = ['blue', 'green', 'purple', 'amber', 'pink', 'teal'];
    const hash = store.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % storeColors.length;
    return storeColors[hash];
  };

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold">Global Inventory Management</h2>
        <p className="text-muted-foreground">Track and manage inventory across all stores.</p>
        </div>
        
      {/* Inventory statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totalInventoryItems}</p>
                </div>
              <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                <Package className="h-5 w-5" />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">{inStockItems}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full text-green-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockItems}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                <XCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store distribution summary */}
      <div className="flex flex-wrap gap-4 mt-4">
        {stores.map((store) => {
          const storeItems = inventoryItems.filter(item => 
            item.store?._id === store._id || item.storeId === store._id
          );
          const storeItemCount = storeItems.length;
          const lowStockCount = storeItems.filter(item => item.quantity < item.threshold && item.quantity > 0).length;
          const outOfStockCount = storeItems.filter(item => item.quantity === 0).length;
          const percentage = inventoryItems.length > 0 
            ? Math.round((storeItemCount / inventoryItems.length) * 100) 
            : 0;
          
          return (
            <Card key={store._id} className="flex-1 min-w-[240px]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <StoreBadge store={store} />
                  <span className="text-xs text-muted-foreground">{percentage}% of total</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Total</span>
                    <span className="font-bold">{storeItemCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Low</span>
                    <span className="font-bold text-amber-600">{lowStockCount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground text-xs">Out</span>
                    <span className="font-bold text-red-600">{outOfStockCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
            value={storeFilter}
            onValueChange={setStoreFilter}
          >
            <SelectTrigger className="w-[180px] border-2 bg-primary/10 border-primary/30 hover:bg-primary/15 transition-colors">
              <StoreIcon className="mr-2 h-4 w-4 text-primary" />
              <span className="font-medium">Store</span>
              </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
              <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">All Stores</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store._id} value={store._id} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                  {store.name}
                </SelectItem>
              ))}
              </SelectContent>
            </Select>
            
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
            <p className="text-muted-foreground mt-2">No inventory items available across any store.</p>
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
                      className="w-[25%] cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                        <div className="flex items-center">
                        Product
                          {sortBy === 'name' && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'}`} />
                          )}
                        </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort('store')}
                    >
                        <div className="flex items-center">
                        Store
                        {sortBy === 'store' && (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => (
                    <TableRow 
                      key={item._id} 
                      className={`hover:bg-muted/40 ${item.store ? `hover:bg-${getStoreColor(item.store)}-50/40` : ''}`}
                    >
                      <TableCell className="font-medium">
                          <div>
                          {item.name}
                          {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                          </div>
                      </TableCell>
                      <TableCell>
                        <StoreBadge store={item.store} />
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
    </div>
  );
};

export default Inventory; 