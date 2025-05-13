import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import {
  Package,
  Search,
  Plus,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  ChevronDown,
  ArrowUpDown,
  Settings,
  MoreHorizontal,
  Tag,
  AlertTriangle,
  ShoppingCart,
  Clipboard,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const StoreOwnerProducts = () => {
  const { toast } = useToast();
  const { selectedStore, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form data for create/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    threshold: 0,
    sku: '',
    image: '',
    usage: 'Agricultural',
    status: 'active'
  });

  // Categories for filtering
  const categories = ['Insecticides', 'Herbicides', 'Fungicides', 'Rodenticides', 'Fertilizers'];

  useEffect(() => {
    if (selectedStore) {
      fetchProducts();
    }
  }, [selectedStore]);

  // Filter products based on search, category, and stock filters
  useEffect(() => {
    if (!products || !products.length) {
      setFilteredProducts([]);
      return;
    }
    
    let results = [...products];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      results = results.filter(product => product.category === categoryFilter);
    }
    
    // Apply stock filter
    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'in-stock':
          results = results.filter(product => product.stock > 0);
          break;
        case 'low-stock':
          results = results.filter(product => product.stock > 0 && product.stock <= product.threshold);
          break;
        case 'out-of-stock':
          results = results.filter(product => product.stock <= 0);
          break;
        default:
          break;
      }
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProducts(results);
  }, [products, searchQuery, categoryFilter, stockFilter, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (!selectedStore || !selectedStore._id) {
        console.error('No selected store found');
        toast({
          title: 'Error',
          description: 'No store selected. Please select a store.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      
      console.log('Fetching products for store:', selectedStore._id);
      // Make sure storeId is included in the request
      const data = await getProducts();
      
      if (!data || data.length === 0) {
        console.log('No products returned from API');
        setProducts([]);
        setFilteredProducts([]);
      } else {
        console.log('Products data received:', data);
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: typeof error === 'string' ? error : 'Failed to fetch products',
        variant: 'destructive',
      });
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCategoryFilter = (value) => {
    setCategoryFilter(value);
  };
  
  const handleStockFilter = (value) => {
    setStockFilter(value);
  };
  
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };
  
  const handleRefresh = () => {
    fetchProducts();
  };

  const handleCreateProduct = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      stock: 0,
      threshold: 0,
      sku: '',
      image: '',
      usage: 'Agricultural',
      status: 'active'
    });
    setShowCreateDialog(true);
  };
  
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      threshold: product.threshold,
      sku: product.sku,
      image: product.image || '',
      usage: product.usage,
      status: product.status
    });
    setShowEditDialog(true);
  };
  
  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'threshold' 
        ? parseFloat(value) 
        : value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const submitCreateProduct = async () => {
    try {
      if (!selectedStore?._id) {
        toast({
          title: 'Error',
          description: 'No store selected',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate required fields
      if (!formData.name || !formData.category || !formData.sku) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      // Add store ID to product data
      const productData = {
        ...formData,
        store: selectedStore._id
      };
      
      const data = await createProduct(productData);
      
      // Update products list
      if (data) {
        setProducts(prev => [...(prev || []), data]);
      }
      
      toast({
        title: 'Success',
        description: 'Product created successfully',
      });
      
      setShowCreateDialog(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: error.toString(),
        variant: 'destructive',
      });
    }
  };
  
  const submitEditProduct = async () => {
    try {
      if (!selectedStore?._id || !selectedProduct?._id) {
        toast({
          title: 'Error',
          description: 'No store or product selected',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate required fields
      if (!formData.name || !formData.category || !formData.sku) {
        toast({
          title: 'Validation Error',
          description: 'Please fill all required fields',
          variant: 'destructive',
        });
        return;
      }
      
      // Add store ID to product data
      const productData = {
        ...formData,
        store: selectedStore._id
      };
      
      const data = await updateProduct(selectedProduct._id, productData);
      
      // Update products list
      if (data) {
        setProducts(prev => 
          prev.map(product => 
            product._id === selectedProduct._id ? { ...product, ...data } : product
          )
        );
      }
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: error.toString(),
        variant: 'destructive',
      });
    }
  };
  
  const submitDeleteProduct = async () => {
    try {
      if (!selectedStore?._id || !selectedProduct?._id) {
        toast({
          title: 'Error',
          description: 'No store or product selected',
          variant: 'destructive',
        });
        return;
      }
      
      await deleteProduct(selectedProduct._id, selectedStore._id);
      
      // Update products list
      setProducts(prev => prev.filter(product => product._id !== selectedProduct._id));
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error.toString(),
        variant: 'destructive',
      });
    }
  };

  const getStockStatusBadge = (product) => {
    if (product.stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.stock <= product.threshold) {
      return <Badge variant="outline" className="text-amber-500 border-amber-500">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="text-emerald-500 border-emerald-500">In Stock</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold">Products</h2>
        <p className="text-muted-foreground">Manage your store's pesticide and agricultural product inventory.</p>
      </div>
      
      {/* Filters and actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search products..." 
              className="pl-10"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="dropdown-container relative">
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <Filter className="h-4 w-4" />
                Category: {categoryFilter === 'all' ? 'All' : categoryFilter}
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="dropdown-menu absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border z-10 hidden">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setCategoryFilter('all')}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button 
                      key={category}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setCategoryFilter(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="dropdown-container relative">
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <Filter className="h-4 w-4" />
                Stock: {stockFilter === 'all' ? 'All' : stockFilter.replace('-', ' ')}
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="dropdown-menu absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border z-10 hidden">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStockFilter('all')}
                  >
                    All Stock Levels
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStockFilter('in-stock')}
                  >
                    In Stock
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStockFilter('low-stock')}
                  >
                    Low Stock
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStockFilter('out-of-stock')}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            onClick={handleCreateProduct}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      {/* Sorting options */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => handleSort('name')}
        >
          Name
          {sortBy === 'name' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => handleSort('category')}
        >
          Category
          {sortBy === 'category' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => handleSort('price')}
        >
          Price
          {sortBy === 'price' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => handleSort('stock')}
        >
          Stock Level
          {sortBy === 'stock' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => handleSort('popularity')}
        >
          Popularity
          {sortBy === 'popularity' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 w-3/4 bg-muted rounded-md mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded-md"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded-md"></div>
                  <div className="h-4 w-3/4 bg-muted rounded-md"></div>
                  <div className="h-4 w-5/6 bg-muted rounded-md"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-9 w-full bg-muted rounded-md"></div>
              </CardFooter>
            </Card>
          ))
        ) : filteredProducts && filteredProducts.length === 0 ? (
          <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Products Found</h3>
              <p className="text-muted-foreground mt-2 text-center max-w-md">
                {searchQuery || categoryFilter !== 'all' || stockFilter !== 'all' ? 
                  "No products match your current filters. Try adjusting your search criteria." : 
                  "You haven't added any products yet. Click 'Add Product' to get started."}
              </p>
              {(searchQuery || categoryFilter !== 'all' || stockFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setStockFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          // Product cards
          filteredProducts && filteredProducts.map(product => (
            <Card key={product.id || product._id} className={`overflow-hidden transition-all ${
              product.stock === 0 ? 'opacity-70' : ''
            }`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{product.name}</CardTitle>
                  {getStockStatusBadge(product)}
                </div>
                <CardDescription className="flex items-center mt-1">
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  {product.category}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="flex flex-col space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{formatCurrency(product.price)}</span>
                    <div className="flex items-center">
                      <Clipboard className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{product.sku}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Stock: <span className={`font-medium ${
                        product.stock === 0 ? 'text-red-500' : 
                        product.stock <= product.threshold ? 'text-amber-500' : 
                        'text-emerald-500'
                      }`}>{product.stock}</span></span>
                    </div>
                    
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>Threshold: {product.threshold}</span>
                    </div>
                  </div>
                  
                  {product.stock <= product.threshold && product.stock > 0 && (
                    <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-2 text-xs text-amber-800 dark:text-amber-300">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>Low stock alert. Consider restocking this product soon.</span>
                      </div>
                    </div>
                  )}
                  
                  {product.stock === 0 && (
                    <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-2 text-xs text-red-800 dark:text-red-300">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-black">Out of stock! This product is unavailable for purchase.</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-0">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                  >
                    <Package className="h-3.5 w-3.5 mr-1" /> Stock
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => handleDeleteProduct(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create Product Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-emerald-700/30 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-emerald-400">Add New Product</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              Fill in the details below to add a new product to your inventory.
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-gray-200">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description" className="text-gray-200">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Product description"
                  className="bg-gray-800 border-gray-700 text-white h-20"
                />
              </div>
              
              <div>
                <Label htmlFor="category" className="text-gray-200">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                  required
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sku" className="text-gray-200">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Unique product code"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price" className="text-gray-200">Price (PKR) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="stock" className="text-gray-200">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="threshold" className="text-gray-200">Low Stock Threshold</Label>
                <Input
                  id="threshold"
                  name="threshold"
                  type="number"
                  min="0"
                  value={formData.threshold}
                  onChange={handleInputChange}
                  placeholder="Alert when below this quantity"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="image" className="text-gray-200">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="usage" className="text-gray-200">Recommended Usage</Label>
                <Select
                  value={formData.usage}
                  onValueChange={(value) => handleSelectChange('usage', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select usage" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="Agricultural">Agricultural</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status" className="text-gray-200">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="border-t border-gray-700 pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                Cancel
              </Button>
              <Button type="button" onClick={submitCreateProduct} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-emerald-700/30 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-emerald-400">Edit Product</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              Update the details of this product in your inventory.
            </DialogDescription>
          </DialogHeader>
          
          <form className="space-y-5 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="col-span-2">
                <Label htmlFor="edit-name" className="text-gray-200">Product Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="edit-description" className="text-gray-200">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Product description"
                  className="bg-gray-800 border-gray-700 text-white h-20"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category" className="text-gray-200">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                  required
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-sku" className="text-gray-200">SKU *</Label>
                <Input
                  id="edit-sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="Unique product code"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-price" className="text-gray-200">Price (PKR) *</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-stock" className="text-gray-200">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-threshold" className="text-gray-200">Low Stock Threshold</Label>
                <Input
                  id="edit-threshold"
                  name="threshold"
                  type="number"
                  min="0"
                  value={formData.threshold}
                  onChange={handleInputChange}
                  placeholder="Alert when below this quantity"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-image" className="text-gray-200">Image URL</Label>
                <Input
                  id="edit-image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-usage" className="text-gray-200">Recommended Usage</Label>
                <Select
                  value={formData.usage}
                  onValueChange={(value) => handleSelectChange('usage', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select usage" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="Agricultural">Agricultural</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-status" className="text-gray-200">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="border-t border-gray-700 pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                Cancel
              </Button>
              <Button type="button" onClick={submitEditProduct} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-[500px] bg-gray-900 text-white border-2 border-emerald-700/30 shadow-lg">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-emerald-400">Delete Product</DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="p-4 my-4 border rounded-md border-gray-700 bg-gray-800">
              <h4 className="font-semibold text-white">{selectedProduct.name}</h4>
              <p className="text-sm text-gray-400 mt-1">SKU: {selectedProduct.sku}</p>
            </div>
          )}
          
          <DialogFooter className="border-t border-gray-700 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={submitDeleteProduct}>
              {loading ? 'Deleting...' : 'Delete Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreOwnerProducts; 