import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Filter, Plus, Edit, Trash, ChevronDown, Download, Upload } from 'lucide-react';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Mock data for products
  const products = [
    { 
      id: 1, 
      name: "MaxKill Insecticide", 
      category: "Insecticide", 
      description: "Effective against a wide range of insects",
      price: 49.99,
      manufacturer: "AgriChem Inc",
      toxicityLevel: "Medium",
      recommendedUse: "Agricultural, Residential",
    },
    { 
      id: 2, 
      name: "HerbControl Plus", 
      category: "Herbicide", 
      description: "Eliminates weeds while preserving crops",
      price: 38.50,
      manufacturer: "GreenTech Solutions",
      toxicityLevel: "Low",
      recommendedUse: "Agricultural",
    },
    { 
      id: 3, 
      name: "FungoClear Solution", 
      category: "Fungicide", 
      description: "Prevents and treats fungal infections in plants",
      price: 65.00,
      manufacturer: "PlantHealth Systems",
      toxicityLevel: "Low",
      recommendedUse: "Agricultural, Gardens",
    },
    { 
      id: 4, 
      name: "RatAway Pellets", 
      category: "Rodenticide", 
      description: "Controls rat and mice populations effectively",
      price: 29.99,
      manufacturer: "PestStop International",
      toxicityLevel: "High",
      recommendedUse: "Warehouses, Residential",
    },
    { 
      id: 5, 
      name: "AntiPest Powder", 
      category: "Insecticide", 
      description: "Powder formula for long-lasting insect control",
      price: 42.50,
      manufacturer: "AgriChem Inc",
      toxicityLevel: "Medium",
      recommendedUse: "Agricultural, Residential",
    },
    { 
      id: 6, 
      name: "WeedBGone", 
      category: "Herbicide", 
      description: "Fast-acting weed elimination solution",
      price: 27.99,
      manufacturer: "GreenTech Solutions",
      toxicityLevel: "Medium",
      recommendedUse: "Gardens, Residential",
    },
    { 
      id: 7, 
      name: "TermiteShield", 
      category: "Insecticide", 
      description: "Specifically designed for termite control",
      price: 89.99,
      manufacturer: "Pest Defense Ltd",
      toxicityLevel: "High",
      recommendedUse: "Structural, Residential",
    },
    { 
      id: 8, 
      name: "MosquitoKiller", 
      category: "Insecticide", 
      description: "Area treatment for mosquito control",
      price: 32.75,
      manufacturer: "HealthGuard Solutions",
      toxicityLevel: "Medium",
      recommendedUse: "Residential, Public Spaces",
    },
    { 
      id: 9, 
      name: "AntControl", 
      category: "Insecticide", 
      description: "Targets ant colonies at the source",
      price: 19.99,
      manufacturer: "PestStop International",
      toxicityLevel: "Low",
      recommendedUse: "Residential, Indoor",
    },
    { 
      id: 10, 
      name: "MoldBuster", 
      category: "Fungicide", 
      description: "Eliminates and prevents mold growth",
      price: 45.50,
      manufacturer: "PlantHealth Systems",
      toxicityLevel: "Medium",
      recommendedUse: "Agricultural, Warehouses",
    },
  ];

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    return (
      (searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === 'All' || product.category === filterCategory)
    );
  });

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

  // Categories for filter
  const categories = ['All', 'Insecticide', 'Herbicide', 'Fungicide', 'Rodenticide'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
          <p className="text-muted-foreground">
            Add, edit and manage your pesticide product catalog
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Product
        </Button>
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
                    className="w-full rounded-md border border-input bg-background py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>

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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/25">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                    <td className="py-3 px-4">{product.manufacturer}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getToxicityColor(product.toxicityLevel)}`}>
                        {product.toxicityLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4">{product.recommendedUse}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1 rounded-md hover:bg-muted">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button className="p-1 rounded-md hover:bg-muted">
                          <Trash className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredProducts.length} of {products.length} products</p>
            <div className="flex gap-1 mt-3 sm:mt-0">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;