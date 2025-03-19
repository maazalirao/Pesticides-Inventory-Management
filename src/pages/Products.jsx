import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Filter, Plus, Edit, Trash, ChevronDown, Download, Upload } from 'lucide-react';
import { getProducts, deleteProduct, createProduct, updateProduct } from '../lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stockQuantity: '',
    manufacturer: '',
    toxicityLevel: 'Low',
    recommendedUse: '',
    sku: '',
    image: 'https://picsum.photos/seed/pesticide/300/300',
    tags: []
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  
  // Fetch products on component mount with cleanup
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        
        if (isMounted) {
          setProducts(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Products fetch error in component:', err);
          setError('Failed to fetch products. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Optimize filtered products calculation with useMemo
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, filterCategory]);

  // Optimize pagination calculations with useMemo
  const { currentItems, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const items = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const total = Math.ceil(filteredProducts.length / itemsPerPage);
    return { currentItems: items, totalPages: total };
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Calculate pagination indices for display
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(product => product._id !== id));
      } catch (error) {
        setError('Failed to delete product');
        console.error(error);
      }
    }
  };

  const handleEditProduct = (product) => {
    setIsEditMode(true);
    setCurrentProductId(product._id);
    setNewProduct({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      manufacturer: product.manufacturer || '',
      toxicityLevel: product.toxicityLevel || 'Low',
      recommendedUse: product.recommendedUse || '',
      sku: product.sku || '',
      image: product.image || 'https://picsum.photos/seed/pesticide/300/300',
      tags: product.tags || []
    });
    setIsDialogOpen(true);
  };

  const handleAddNewProduct = () => {
    setIsEditMode(false);
    setCurrentProductId(null);
    setNewProduct({
      name: '',
      description: '',
      category: '',
      price: '',
      stockQuantity: '',
      manufacturer: '',
      toxicityLevel: 'Low',
      recommendedUse: '',
      sku: '',
      image: 'https://picsum.photos/seed/pesticide/300/300',
      tags: []
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: name === 'price' || name === 'stockQuantity' 
        ? parseFloat(value) || ''
        : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!newProduct.name || !newProduct.category || !newProduct.price) {
        setFormError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      let result;
      if (isEditMode) {
        result = await updateProduct(currentProductId, newProduct);
        // Update the product in the list
        setProducts(products.map(p => p._id === currentProductId ? result : p));
      } else {
        result = await createProduct(newProduct);
        // Add the new product to the list
        setProducts([...products, result]);
      }
      
      // Reset form and close dialog
      setNewProduct({
        name: '',
        description: '',
        category: '',
        price: '',
        stockQuantity: '',
        manufacturer: '',
        toxicityLevel: 'Low',
        recommendedUse: '',
        sku: '',
        image: 'https://picsum.photos/seed/pesticide/300/300',
        tags: []
      });
      setIsDialogOpen(false);
    } catch (error) {
      setFormError(error.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Create a function to generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3; // Show max 3 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If we have 3 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show current page, plus one on each side if possible
      let startPage = Math.max(1, currentPage - 1);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      // Adjust if we're near the end
      if (endPage - startPage < maxPagesToShow - 1) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  // Get unique categories for filter dropdown
  const categories = ['All', ...new Set(products.map(product => product.category).filter(Boolean))];

  // Toxicity level badge color
  const getToxicityColor = (level) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Export products to CSV
  const exportProducts = () => {
    // Get the products to export (either filtered or all)
    const productsToExport = filteredProducts.length > 0 ? filteredProducts : products;
    
    if (productsToExport.length === 0) {
      alert('No products to export');
      return;
    }
    
    // Define the fields to export
    const fields = [
      'name', 'description', 'category', 'price', 'stockQuantity',
      'manufacturer', 'toxicityLevel', 'recommendedUse', 'sku', 'image'
    ];
    
    // Create CSV header
    let csv = fields.join(',') + '\n';
    
    // Add data rows
    productsToExport.forEach(product => {
      const row = fields.map(field => {
        // Format the value, wrap in quotes, and escape quotes inside
        let value = product[field] !== undefined ? product[field] : '';
        // Convert to string and handle quotes
        value = String(value).replace(/"/g, '""');
        return `"${value}"`;
      });
      csv += row.join(',') + '\n';
    });
    
    // Create blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pesticide-products-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Trigger file input click when Import button is clicked
  const handleImportClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle file selection for import
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setImportError('');
    setImportSuccess('');
    
    if (!file) return;
    
    // Check file extension
    if (!file.name.endsWith('.csv')) {
      setImportError('Only CSV files are supported');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        
        // Get headers
        const headers = lines[0].split(',').map(header => 
          header.trim().replace(/^"(.*)"$/, '$1')
        );
        
        // Parse products
        const newProducts = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          if (!values) continue;
          
          const product = {};
          headers.forEach((header, index) => {
            // Extract value, remove quotes
            let value = values[index]?.trim().replace(/^"(.*)"$/, '$1').replace(/""/g, '"') || '';
            
            // Convert numeric fields
            if (header === 'price' || header === 'stockQuantity') {
              value = value === '' ? 0 : parseFloat(value);
            }
            
            product[header] = value;
          });
          
          // Validate required fields
          if (product.name && product.category && product.price !== undefined) {
            newProducts.push(product);
          }
        }
        
        if (newProducts.length === 0) {
          setImportError('No valid products found in the file');
          return;
        }
        
        // Create products in database
        let successCount = 0;
        for (const product of newProducts) {
          try {
            const result = await createProduct(product);
            if (result && result._id) {
              successCount++;
              setProducts(prevProducts => [...prevProducts, result]);
            }
          } catch (error) {
            console.error('Failed to import product:', error);
          }
        }
        
        setImportSuccess(`Successfully imported ${successCount} of ${newProducts.length} products`);
        
        // Reset file input
        e.target.value = null;
      } catch (error) {
        setImportError('Failed to parse the file: ' + error.message);
        console.error(error);
      }
    };
    
    reader.onerror = () => {
      setImportError('Failed to read the file');
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="hidden md:block text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="hidden md:block text-muted-foreground">
            Add, edit and manage your pesticide product catalog
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90" onClick={handleAddNewProduct}>
              <Plus className="h-4 w-4" />
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <DialogHeader className="border-b border-gray-700 pb-4">
              <DialogTitle className="text-xl font-bold text-primary">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-sm mt-1">
                {isEditMode 
                  ? 'Update the details of this product in your inventory.' 
                  : 'Fill in the details below to add a new product to your inventory.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-5">
              {formError && (
                <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-gray-200 flex items-center">
                    Product Name <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={newProduct.name}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-semibold text-gray-200 flex items-center">
                    Category <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="category"
                    name="category"
                    value={newProduct.category}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-semibold text-gray-200 flex items-center">
                    Price <span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stockQuantity" className="text-sm font-semibold text-gray-200">
                    Stock Quantity
                  </label>
                  <input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    value={newProduct.stockQuantity}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sku" className="text-sm font-semibold text-gray-200">
                    SKU
                  </label>
                  <input
                    id="sku"
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="manufacturer" className="text-sm font-semibold text-gray-200">
                    Manufacturer
                  </label>
                  <input
                    id="manufacturer"
                    name="manufacturer"
                    value={newProduct.manufacturer}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="toxicityLevel" className="text-sm font-semibold text-gray-200">
                    Toxicity Level
                  </label>
                  <select
                    id="toxicityLevel"
                    name="toxicityLevel"
                    value={newProduct.toxicityLevel}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="recommendedUse" className="text-sm font-semibold text-gray-200">
                    Recommended Use
                  </label>
                  <input
                    id="recommendedUse"
                    name="recommendedUse"
                    value={newProduct.recommendedUse}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="image" className="text-sm font-semibold text-gray-200">
                    Image URL
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="text"
                    value={newProduct.image}
                    onChange={handleInputChange}
                    placeholder="https://picsum.photos/seed/pesticide/300/300"
                    className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-semibold text-gray-200">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                ></textarea>
              </div>
              <div className="pt-3 border-t border-gray-700 mt-4">
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
                    {isSubmitting 
                      ? (isEditMode ? 'Updating...' : 'Creating...') 
                      : (isEditMode ? 'Update Product' : 'Create Product')}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Products</CardTitle>
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
                placeholder="Search by name or manufacturer..."
                className="pl-10 w-full rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative inline-block w-48">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full rounded-md border border-input bg-background py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <Button variant="outline" className="flex items-center gap-2" onClick={exportProducts}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button variant="outline" className="flex items-center gap-2" onClick={handleImportClick}>
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

          {importError && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {importError}
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
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="py-3 px-4 text-left font-medium">Product Name</th>
                    <th className="py-3 px-4 text-left font-medium">Category</th>
                    <th className="py-3 px-4 text-left font-medium">Price</th>
                    <th className="py-3 px-4 text-left font-medium">Manufacturer</th>
                    <th className="py-3 px-4 text-left font-medium">Toxicity Level</th>
                    <th className="py-3 px-4 text-left font-medium">Recommended Use</th>
                    <th className="py-3 px-4 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((product) => (
                    <tr key={product._id} className="border-b hover:bg-muted/25">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-16 w-16 rounded-md overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 flex-shrink-0 p-[2px] shadow-lg shadow-indigo-500/20 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
                            <div className="h-full w-full rounded overflow-hidden relative">
                              <img 
                                src={product.image || 'https://i.imgur.com/bnDHhKe.jpg'} 
                                alt={product.name}
                                className="h-full w-full object-cover z-0"
                                onError={(e) => {e.target.src = 'https://i.imgur.com/bnDHhKe.jpg'}}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500 z-20"></div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.description?.substring(0, 60)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4">{product.price?.toFixed(2)} Rs</td>
                      <td className="py-3 px-4">{product.manufacturer}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToxicityColor(product.toxicityLevel)}`}>
                          {product.toxicityLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4">{product.recommendedUse}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button 
                            className="p-1 rounded-md hover:bg-muted"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </button>
                          <button className="p-1 rounded-md hover:bg-muted" onClick={() => handleDeleteProduct(product._id)}>
                            <Trash className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
              <p>Showing {Math.min(indexOfFirstItem + 1, filteredProducts.length)} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products</p>
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
    </div>
  );
};

export default Products;