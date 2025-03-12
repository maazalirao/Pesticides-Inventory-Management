import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Filter, Plus, Edit, Trash, ChevronDown, Download, Upload } from 'lucide-react';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // Mock data for inventory items
  const inventoryItems = [
    { 
      id: 1, 
      name: "MaxKill Insecticide", 
      category: "Insecticide", 
      stock: 45, 
      minStock: 10, 
      entryDate: "2023-05-15", 
      expiryDate: "2024-05-15", 
      batchNumber: "INS-2023-001" 
    },
    { 
      id: 2, 
      name: "HerbControl Plus", 
      category: "Herbicide", 
      stock: 28, 
      minStock: 15, 
      entryDate: "2023-06-20", 
      expiryDate: "2024-06-20", 
      batchNumber: "HRB-2023-015" 
    },
    { 
      id: 3, 
      name: "FungoClear Solution", 
      category: "Fungicide", 
      stock: 16, 
      minStock: 8, 
      entryDate: "2023-07-10", 
      expiryDate: "2024-03-10", 
      batchNumber: "FNG-2023-032" 
    },
    { 
      id: 4, 
      name: "RatAway Pellets", 
      category: "Rodenticide", 
      stock: 34, 
      minStock: 20, 
      entryDate: "2023-05-25", 
      expiryDate: "2024-05-25", 
      batchNumber: "ROD-2023-008" 
    },
    { 
      id: 5, 
      name: "AntiPest Powder", 
      category: "Insecticide", 
      stock: 22, 
      minStock: 12, 
      entryDate: "2023-08-05", 
      expiryDate: "2024-08-05", 
      batchNumber: "INS-2023-045" 
    },
    { 
      id: 6, 
      name: "WeedBGone", 
      category: "Herbicide", 
      stock: 6, 
      minStock: 10, 
      entryDate: "2023-09-15", 
      expiryDate: "2024-09-15", 
      batchNumber: "HRB-2023-078" 
    },
    { 
      id: 7, 
      name: "TermiteShield", 
      category: "Insecticide", 
      stock: 2, 
      minStock: 8, 
      entryDate: "2023-10-20", 
      expiryDate: "2024-04-20", 
      batchNumber: "INS-2023-102" 
    },
    { 
      id: 8, 
      name: "MosquitoKiller", 
      category: "Insecticide", 
      stock: 4, 
      minStock: 12, 
      entryDate: "2023-11-05", 
      expiryDate: "2024-05-05", 
      batchNumber: "INS-2023-145" 
    },
    { 
      id: 9, 
      name: "AntControl", 
      category: "Insecticide", 
      stock: 38, 
      minStock: 15, 
      entryDate: "2023-06-10", 
      expiryDate: "2024-06-10", 
      batchNumber: "INS-2023-067" 
    },
    { 
      id: 10, 
      name: "MoldBuster", 
      category: "Fungicide", 
      stock: 19, 
      minStock: 10, 
      entryDate: "2023-07-22", 
      expiryDate: "2024-07-22", 
      batchNumber: "FNG-2023-054" 
    },
  ];

  // Filter inventory based on search term and category
  const filteredInventory = inventoryItems.filter((item) => {
    return (
      (searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === 'All' || item.category === filterCategory)
    );
  });

  // Calculate inventory status
  const getStatus = (stock, minStock) => {
    if (stock <= 0) return { label: 'Out of Stock', className: 'bg-red-100 text-red-800' };
    if (stock < minStock) return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', className: 'bg-green-100 text-green-800' };
  };

  // Categories for filter
  const categories = ['All', 'Insecticide', 'Herbicide', 'Fungicide', 'Rodenticide'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your pesticide inventory, monitor stock levels, and track expiry dates
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Item
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Inventory Items</CardTitle>
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
                placeholder="Search by name or batch number..."
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
                  <th className="py-3 px-4 text-left font-medium">Item Name</th>
                  <th className="py-3 px-4 text-left font-medium">Category</th>
                  <th className="py-3 px-4 text-left font-medium">Stock</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Entry Date</th>
                  <th className="py-3 px-4 text-left font-medium">Expiry Date</th>
                  <th className="py-3 px-4 text-left font-medium">Batch Number</th>
                  <th className="py-3 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => {
                  const status = getStatus(item.stock, item.minStock);
                  const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <tr key={item.id} className="border-b hover:bg-muted/25">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.category}</td>
                      <td className="py-3 px-4">{item.stock} units</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">{item.entryDate}</td>
                      <td className={`py-3 px-4 ${isExpiringSoon ? 'text-yellow-600 font-medium' : ''}`}>
                        {item.expiryDate}
                      </td>
                      <td className="py-3 px-4">{item.batchNumber}</td>
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
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredInventory.length} of {inventoryItems.length} items</p>
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

export default Inventory; 