"// Creating admin dashboard file" 

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Store,
  Package,
  DollarSign,
  Users,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Calendar,
  ArrowRight,
  BarChart2,
  Clock,
  Info,
  Truck,
  ShieldCheck,
  Check,
  Eye,
  Filter,
  Download,
  ChevronDown,
  Database,
  XCircle
} from 'lucide-react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  getAllStoresProducts,
  getAllStoresInventory,
  getAllStoresSuppliers,
  getAllStoresCustomers,
  getAllStores
} from '../../lib/api.js';
import { Loader } from '../../components/ui/loader';
import StatCard from '../../components/ui/stat-card';
import { Badge } from '../../components/ui/badge';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const StoreBadge = ({ storeName }) => {
  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">
      {storeName || "Unknown Store"}
    </Badge>
  );
};

const Dashboard = () => {
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for all data
  const [allProducts, setAllProducts] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [statistics, setStatistics] = useState([]);

  // Load all data
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Loading admin dashboard data...');
        
        // Load all data from all stores
        const [productsData, inventoryData, suppliersData, customersData, storesData] = await Promise.all([
          getAllStoresProducts().catch(err => {
            console.error('Error loading products:', err);
            return { products: [] };
          }),
          getAllStoresInventory().catch(err => {
            console.error('Error loading inventory:', err);
            return { inventory: [] };
          }),
          getAllStoresSuppliers().catch(err => {
            console.error('Error loading suppliers:', err);
            return { suppliers: [] };
          }),
          getAllStoresCustomers().catch(err => {
            console.error('Error loading customers:', err);
            return { customers: [] };
          }),
          getAllStores().catch(err => {
            console.error('Error loading stores:', err);
            return { stores: [] };
          })
        ]);

        // Extract arrays from responses
        const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
        const inventory = Array.isArray(inventoryData) ? inventoryData : (inventoryData.inventory || []);
        const suppliers = Array.isArray(suppliersData) ? suppliersData : (suppliersData.suppliers || []);
        const customers = Array.isArray(customersData) ? customersData : (customersData.customers || []);
        const stores = Array.isArray(storesData) ? storesData : (storesData.stores || []);

        console.log('Data loaded:', {
          products: products.length,
          inventory: inventory.length,
          suppliers: suppliers.length,
          customers: customers.length,
          stores: stores.length
        });

        // Set the data
        setAllProducts(products);
        setAllInventory(inventory);
        setAllSuppliers(suppliers);
        setAllCustomers(customers);
        setAllStores(stores);

        // Calculate statistics from the loaded data
        const lowStockCount = inventory.filter(item => 
          item.quantity < (item.threshold || 10) && item.quantity > 0
        ).length;

        const outOfStockCount = inventory.filter(item => 
          !item.quantity || item.quantity === 0
        ).length;

        const totalRevenue = inventory.reduce((sum, item) => 
          sum + (item.price || 0) * (item.quantity || 0), 0
        );

        const calculatedStats = [
          {
            title: "Total Products",
            value: products.length.toLocaleString(),
            description: "Total products across all stores",
            icon: "Package",
            iconClass: "bg-blue-100 text-blue-600",
            change: "+5% from last month",
            changeType: "positive"
          },
          {
            title: "Total Inventory Items",
            value: inventory.length.toLocaleString(),
            description: "Inventory items across all stores",
            icon: "Package",
            iconClass: "bg-green-100 text-green-600",
            change: "+3% from last month",
            changeType: "positive"
          },
          {
            title: "Low Stock Items",
            value: lowStockCount.toLocaleString(),
            description: "Products below minimum threshold",
            icon: "AlertTriangle",
            iconClass: "bg-yellow-100 text-yellow-600",
            change: outOfStockCount > 0 ? `${outOfStockCount} out of stock` : "No items out of stock",
            changeType: lowStockCount > 0 ? "negative" : "positive"
          },
          {
            title: "Total Stores",
            value: stores.length.toLocaleString(),
            description: "Active stores in the system",
            icon: "Store",
            iconClass: "bg-purple-100 text-purple-600",
            change: "All stores active",
            changeType: "positive"
          },
          {
            title: "Total Suppliers",
            value: suppliers.length.toLocaleString(),
            description: "Registered suppliers",
            icon: "Truck",
            iconClass: "bg-orange-100 text-orange-600",
            change: "+2% from last month",
            changeType: "positive"
          },
          {
            title: "Total Customers",
            value: customers.length.toLocaleString(),
            description: "Registered customers",
            icon: "Users",
            iconClass: "bg-indigo-100 text-indigo-600",
            change: "+8% from last month",
            changeType: "positive"
          }
        ];

        setStatistics(calculatedStats);
        setLoading(false);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Handle refresh button click
  const handleRefresh = () => {
    // Reload all data
    setLoading(true);
    setError(null);
    
    // Re-trigger the useEffect
    window.location.reload();
  };

  // Memoized calculations for performance
  const inventoryStats = useMemo(() => {
    if (!allInventory.length) {
      return { lowStock: 0, outOfStock: 0, criticalItems: [], categories: [] };
    }
    
    const lowStock = allInventory.filter(item => 
      item.quantity < (item.threshold || 10) && item.quantity > 0
    ).length;
    
    const outOfStock = allInventory.filter(item => 
      !item.quantity || item.quantity === 0
    ).length;
    
    const criticalItems = allInventory
      .filter(item => item.quantity < (item.threshold || 10))
      .sort((a, b) => (a.quantity || 0) - (b.quantity || 0))
      .slice(0, 10);
    
    // Calculate category data
    const categoryMap = new Map();
    allInventory.forEach(item => {
      const category = item.category || "Uncategorized";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category).push(item);
    });
    
    const categories = Array.from(categoryMap.entries()).map(([category, items]) => {
      const lowStockCount = items.filter(item => 
        item.quantity < (item.threshold || 10) && item.quantity > 0
      ).length;
      const outOfStockCount = items.filter(item => 
        !item.quantity || item.quantity === 0
      ).length;
      const totalValue = items.reduce((sum, item) => 
        sum + (item.price || 0) * (item.quantity || 0), 0
      );
      
      // Store distribution
      const storeDistribution = {};
      items.forEach(item => {
        const storeName = item.store?.name || "Unknown Store";
        storeDistribution[storeName] = (storeDistribution[storeName] || 0) + 1;
      });
      
      return {
        name: category,
        items,
        count: items.length,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalValue,
        storeDistribution
      };
    });
    
    return { lowStock, outOfStock, criticalItems, categories };
  }, [allInventory]);

  // Chart data for inventory distribution by category
  const inventoryChartData = useMemo(() => {
    const categoryData = inventoryStats.categories;
    return {
      labels: categoryData.map(cat => cat.name),
      datasets: [{
        label: 'Items by Category',
        data: categoryData.map(cat => cat.count),
        backgroundColor: [
          '#10B981', // green
          '#3B82F6', // blue
          '#8B5CF6', // purple
          '#F59E0B', // amber
          '#EF4444', // red
          '#6B7280'  // gray
        ],
        borderWidth: 0
      }]
    };
  }, [inventoryStats]);

  // Chart data for store distribution
  const storeChartData = useMemo(() => {
    const storeDistribution = {};
    allInventory.forEach(item => {
      const storeName = item.store?.name || "Unknown Store";
      storeDistribution[storeName] = (storeDistribution[storeName] || 0) + 1;
    });

    return {
      labels: Object.keys(storeDistribution),
      datasets: [{
        label: 'Items by Store',
        data: Object.values(storeDistribution),
        backgroundColor: [
          '#10B981', // green
          '#3B82F6', // blue
          '#8B5CF6', // purple
          '#F59E0B', // amber
          '#EF4444', // red
          '#6B7280'  // gray
        ],
        borderWidth: 0
      }]
    };
  }, [allInventory]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Doughnut chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
    cutout: '70%',
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-muted-foreground">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of metrics from all stores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error and loading states */}
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      {/* Admin Dashboard Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {statistics.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventory by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Inventory by Category
            </CardTitle>
            <CardDescription>
              Distribution of inventory items across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Doughnut data={inventoryChartData} options={doughnutOptions} />
                      </div>
                    </CardContent>
                  </Card>
                  
        {/* Inventory by Store */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Inventory by Store
            </CardTitle>
            <CardDescription>
              Distribution of inventory items across different stores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Doughnut data={storeChartData} options={doughnutOptions} />
                            </div>
                          </CardContent>
        </Card>
      </div>

      {/* Critical Items Section */}
      {inventoryStats.criticalItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Critical Stock Items
            </CardTitle>
            <CardDescription>
              Items that are running low on stock and need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryStats.criticalItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.store && <StoreBadge storeName={item.store.name} />}
                        <span className="ml-2">{item.category}</span>
                      </p>
              </div>
              </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-800">
                      {item.quantity || 0} left
                    </p>
                    <p className="text-sm text-gray-600">
                      Threshold: {item.threshold || 10}
                    </p>
                            </div>
                          </div>
              ))}
                          </div>
                        </CardContent>
                      </Card>
      )}

      {/* Category Overview */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Category Overview
          </CardTitle>
          <CardDescription>
            Detailed breakdown of inventory by category across all stores
          </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {inventoryStats.categories.map((category, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <Badge variant="outline">{category.count} items</Badge>
              </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{category.count}</p>
                    <p className="text-sm text-gray-600">Total Items</p>
                            </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{category.lowStock}</p>
                    <p className="text-sm text-gray-600">Low Stock</p>
                          </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{category.outOfStock}</p>
                    <p className="text-sm text-gray-600">Out of Stock</p>
                          </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(category.totalValue)}</p>
                    <p className="text-sm text-gray-600">Total Value</p>
                </div>
      </div>

                {/* Store Distribution for this category */}
              <div>
                  <p className="text-sm font-medium mb-2">Store Distribution:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(category.storeDistribution).map(([storeName, count]) => (
                      <span key={storeName} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {storeName}: {count}
                      </span>
                    ))}
              </div>
            </div>
              </div>
            ))}
                          </div>
                        </CardContent>
                      </Card>
    </div>
  );
};

// Helper function to get icons (simplified version)
const getIcon = (iconName) => {
  const icons = {
    Package: Package,
    Store: Store,
    AlertTriangle: AlertTriangle,
    Users: Users,
    Truck: Truck,
    DollarSign: DollarSign,
    ShoppingCart: ShoppingCart
  };
  
  const IconComponent = icons[iconName] || Package;
  return <IconComponent className="h-5 w-5" />;
};

export default Dashboard; 