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
  getAdminDashboardStats, 
  getAllStoresProducts,
  getAllStoresInventory,
  getAllStoresSuppliers,
  getAllStoresCustomers
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

// Simple cache with 5 minute expiry
const dashboardCache = {
  data: null,
  timestamp: 0,
  isValid: () => dashboardCache.data && (Date.now() - dashboardCache.timestamp < 5 * 60 * 1000)
};

const Dashboard = () => {
  // State for dashboard filters and data
  const [timeRange, setTimeRange] = useState('year');
  const [category, setCategory] = useState('all');
  
  // Separate loading states for better UX
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  
  // State for essential data (loaded first)
  const [statistics, setStatistics] = useState([]);
  const [dashboardReady, setDashboardReady] = useState(false);
  
  // State for detailed data (loaded after stats)
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: []
  });
  const [inventoryData, setInventoryData] = useState({
    labels: [],
    datasets: []
  });
  const [customerSegmentData, setCustomerSegmentData] = useState({
    labels: [],
    datasets: []
  });
  const [forecastData, setForecastData] = useState({
    labels: [],
    datasets: []
  });
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  
  // New state for global data (loaded on demand)
  const [allProducts, setAllProducts] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allStores, setAllStores] = useState([]);

  // Load essential stats first (priority loading)
  useEffect(() => {
    const loadEssentialData = async () => {
      // Check cache first
      if (dashboardCache.isValid()) {
        console.log('Using cached dashboard data');
        const cached = dashboardCache.data;
        setStatistics(cached.statistics || []);
        setAllStores(cached.allStores || []);
        setLoadingStats(false);
        setDashboardReady(true);
        return;
      }

      setLoadingStats(true);
      setError(null);
      
      try {
        console.log('Fetching essential dashboard stats...');
        // Only load critical stats first
        const dashboardStats = await getAdminDashboardStats();
        
        console.log('Essential data loaded:', !!dashboardStats);
        
        if (dashboardStats) {
          setStatistics(dashboardStats.statistics || []);
          setAllStores(dashboardStats.stores || []);
          
          // Cache the essential data
          dashboardCache.data = {
            statistics: dashboardStats.statistics || [],
            allStores: dashboardStats.stores || []
          };
          dashboardCache.timestamp = Date.now();
        }
        
        setLoadingStats(false);
        setDashboardReady(true);
        
      } catch (error) {
        console.error('Error loading essential data:', error);
        setError(error.message || 'Failed to load dashboard data');
        setLoadingStats(false);
      }
    };

    loadEssentialData();
  }, []);

  // Load detailed data after essential data is ready (lazy loading)
  useEffect(() => {
    if (!dashboardReady) return;

    const loadDetailedData = async () => {
      setLoadingDetails(true);
      
      try {
        console.log('Loading detailed dashboard data...');
        
        // Load non-critical data with a slight delay to prioritize essential content
        setTimeout(async () => {
          try {
            // Load only the most important secondary data
            const [productsData, inventoryData] = await Promise.all([
              getAllStoresProducts(),
              getAllStoresInventory()
            ]);
            
            // Process products data
            if (productsData) {
              const products = Array.isArray(productsData) ? productsData : (productsData.products || []);
              setAllProducts(products);
            }
            
            // Process inventory data
            if (inventoryData) {
              const inventory = Array.isArray(inventoryData) ? inventoryData : (inventoryData.inventory || []);
              setAllInventory(inventory);
            }
            
            setLoadingDetails(false);
            
          } catch (error) {
            console.error('Error loading detailed data:', error);
            setLoadingDetails(false);
          }
        }, 300); // Small delay to ensure smooth UX
        
      } catch (error) {
        console.error('Error in detailed data loading:', error);
        setLoadingDetails(false);
      }
    };

    loadDetailedData();
  }, [dashboardReady]);

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
    
    // Pre-calculate category data to avoid expensive re-calculations in render
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

  // Handle refresh button click
  const handleRefresh = () => {
    // Clear cache and reload essential data only
    dashboardCache.data = null;
    setLoadingStats(true);
    setDashboardReady(false);
    
    // Reload essential data first
    const loadEssentialData = async () => {
      try {
        const dashboardStats = await getAdminDashboardStats();
        if (dashboardStats) {
          setStatistics(dashboardStats.statistics || []);
          setAllStores(dashboardStats.stores || []);
          
          // Update cache
          dashboardCache.data = {
            statistics: dashboardStats.statistics || [],
            allStores: dashboardStats.stores || []
          };
          dashboardCache.timestamp = Date.now();
        }
        setLoadingStats(false);
        setDashboardReady(true);
      } catch (error) {
        console.error('Error refreshing data:', error);
        setError(error.message || 'Failed to refresh data');
        setLoadingStats(false);
      }
    };
    
    loadEssentialData();
  };
  
  // Handle time range change
  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

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

  if (loadingStats) {
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
      {loadingStats && <div className="p-4 flex justify-center"><Loader className="animate-spin h-6 w-6" /></div>}

      {/* Admin Dashboard Summary Stats - Now responsive with 2 cards per row on mobile */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Products" 
          value={allProducts.length || 0} 
          icon="Package2" 
          description={`Across ${allStores.length} stores`}
          loading={loadingStats}
        />
        <StatCard 
          title="Total Inventory Items" 
          value={allInventory.length || 0} 
          icon="Boxes" 
          description={`${allInventory.filter(i => i.quantity < (i.threshold || 10)).length} low stock items`}
          loading={loadingStats}
        />
        <StatCard 
          title="Total Suppliers" 
          value={allSuppliers.length || 0} 
          icon="Factory" 
          description={`Across ${allStores.length} stores`}
          loading={loadingStats}
        />
        <StatCard 
          title="Total Customers" 
          value={allCustomers.length || 0} 
          icon="Users" 
          description={`Across ${allStores.length} stores`}
          loading={loadingStats}
        />
      </div>

      {/* Global inventory overview - Responsive card grid on mobile */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <CardTitle>Global Inventory Overview</CardTitle>
                <CardDescription>Comprehensive inventory data across all stores</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/inventory'}>
                View Full Inventory
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : allInventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">
                  <Database className="h-12 w-12 mx-auto opacity-20" />
                </div>
                <p>No inventory data available across stores</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div>
                {/* Mobile responsive card grid - 3 cards in a grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="mr-4 bg-green-100 p-2 rounded-full">
                          <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700">Total Items</p>
                          <p className="text-2xl font-bold">{allInventory.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="mr-4 bg-amber-100 p-2 rounded-full">
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-700">Low Stock Items</p>
                          <p className="text-2xl font-bold">
                            {inventoryStats.lowStock}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="mr-4 bg-red-100 p-2 rounded-full">
                          <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-700">Out of Stock</p>
                          <p className="text-2xl font-bold">
                            {inventoryStats.outOfStock}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Inventory by Category</h3>
                {/* Make tables responsive with horizontal scroll on mobile */}
                <div className="overflow-x-auto rounded-lg border mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left font-medium py-2 px-4">Category</th>
                        <th className="text-left font-medium py-2 px-4">Store Distribution</th>
                        <th className="text-right font-medium py-2 px-4">Items Count</th>
                        <th className="text-right font-medium py-2 px-4">In Stock Value</th>
                        <th className="text-right font-medium py-2 px-4">Low Stock</th>
                        <th className="text-right font-medium py-2 px-4">Out of Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryStats.categories.map((category, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{category.name}</td>
                          <td className="py-2 px-4">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(category.storeDistribution).map(([storeName, count], i) => (
                                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                                  {storeName} ({count})
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-2 px-4 text-right">{category.count}</td>
                          <td className="py-2 px-4 text-right">₨ {category.totalValue.toLocaleString()}</td>
                          <td className="py-2 px-4 text-right">
                            <span className={`${category.lowStock > 0 ? 'text-amber-600' : ''}`}>
                              {category.lowStock}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-right">
                            <span className={`${category.outOfStock > 0 ? 'text-red-600' : ''}`}>
                              {category.outOfStock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold mb-3">Critical Items</h3>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left font-medium py-2 px-4">Product</th>
                        <th className="text-left font-medium py-2 px-4">Store</th>
                        <th className="text-left font-medium py-2 px-4">Category</th>
                        <th className="text-right font-medium py-2 px-4">Quantity</th>
                        <th className="text-right font-medium py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Show most critical items first - out of stock or very low stock */}
                      {inventoryStats.criticalItems.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">{item.name || item.productName || 'Unnamed'}</td>
                          <td className="py-2 px-4">
                            <StoreBadge storeName={item.store?.name} />
                          </td>
                          <td className="py-2 px-4">{item.category || "Uncategorized"}</td>
                          <td className="py-2 px-4 text-right">{item.quantity || 0} {item.unit}</td>
                          <td className="py-2 px-4 text-right">
                            {!item.quantity || item.quantity === 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800">
                                Out of Stock
                              </span>
                            ) : item.quantity < (item.threshold || 10) ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Showing critical items from {allStores.length} stores
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Additional new section for store comparison */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <CardTitle>Store Performance Comparison</CardTitle>
                <CardDescription>Inventory and business metrics across stores</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/stores'}>
                  Manage Stores
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : allStores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No store data available</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Data
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium py-2 px-4">Store</th>
                        <th className="text-right font-medium py-2 px-4">Total Products</th>
                        <th className="text-right font-medium py-2 px-4">Inventory Items</th>
                        <th className="text-right font-medium py-2 px-4">Inventory Value</th>
                        <th className="text-right font-medium py-2 px-4">Low Stock</th>
                        <th className="text-right font-medium py-2 px-4">Out of Stock</th>
                        <th className="text-right font-medium py-2 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStores.map((store, index) => {
                        const storeInventory = allInventory.filter(item => 
                          item.store?._id === store._id || item.storeId === store._id
                        );
                        const storeProducts = allProducts.filter(item => 
                          item.store?._id === store._id || item.storeId === store._id
                        );
                        const lowStock = storeInventory.filter(item => 
                          item.quantity < (item.threshold || 10) && item.quantity > 0
                        ).length;
                        const outOfStock = storeInventory.filter(item => 
                          !item.quantity || item.quantity === 0
                        ).length;
                        const inventoryValue = storeInventory.reduce((sum, item) => 
                          sum + (item.price || 0) * (item.quantity || 0)
                        , 0);
                        
                        // Generate a light background color based on store index
                        const colors = [
                          'bg-blue-50', 'bg-green-50', 'bg-purple-50', 
                          'bg-amber-50', 'bg-pink-50', 'bg-teal-50'
                        ];
                        const bgColor = colors[index % colors.length];
                        
                        return (
                          <tr key={index} className={`border-b hover:${bgColor}`}>
                            <td className="py-2 px-4">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${bgColor.replace('50', '400')}`}></div>
                                <span className="font-medium">{store.name}</span>
                              </div>
                            </td>
                            <td className="py-2 px-4 text-right">{storeProducts.length}</td>
                            <td className="py-2 px-4 text-right">{storeInventory.length}</td>
                            <td className="py-2 px-4 text-right">₨ {inventoryValue.toLocaleString()}</td>
                            <td className="py-2 px-4 text-right">
                              <span className={`${lowStock > 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                                {lowStock}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-right">
                              <span className={`${outOfStock > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                {outOfStock}
                              </span>
                            </td>
                            <td className="py-2 px-4 text-right">
                              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => {
                                localStorage.setItem('selectedStoreId', store._id);
                                window.location.href = '/inventory';
                              }}>
                                View Store
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Store Distribution</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {allStores.map((store, index) => {
                      const storeInventory = allInventory.filter(item => 
                        item.store?._id === store._id || item.storeId === store._id
                      );
                      const storeProducts = allProducts.filter(item => 
                        item.store?._id === store._id || item.storeId === store._id
                      );
                      const storeSuppliers = allSuppliers.filter(item => 
                        item.store?._id === store._id || item.storeId === store._id
                      );
                      const storeCustomers = allCustomers.filter(item => 
                        item.store?._id === store._id || item.storeId === store._id
                      );
                      
                      // Generate a light background color based on store index
                      const colors = [
                        'bg-blue-50', 'bg-green-50', 'bg-purple-50', 
                        'bg-amber-50', 'bg-pink-50', 'bg-teal-50'
                      ];
                      const textColors = [
                        'text-blue-600', 'text-green-600', 'text-purple-600', 
                        'text-amber-600', 'text-pink-600', 'text-teal-600'
                      ];
                      const bgColor = colors[index % colors.length];
                      const textColor = textColors[index % textColors.length];
                      
                      return (
                        <Card key={index} className={`${bgColor} border-0`}>
                          <CardContent className="p-4">
                            <div className="flex items-center mb-3">
                              <div className={`w-3 h-3 rounded-full mr-2 ${bgColor.replace('50', '400')}`}></div>
                              <h3 className={`font-medium ${textColor}`}>{store.name}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="text-muted-foreground">Products</p>
                                <p className="font-medium">{storeProducts.length}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Inventory</p>
                                <p className="font-medium">{storeInventory.length}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Suppliers</p>
                                <p className="font-medium">{storeSuppliers.length}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Customers</p>
                                <p className="font-medium">{storeCustomers.length}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-muted-foreground">
                Showing performance metrics for {allStores.length} stores
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Products by Store */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <CardTitle>Products by Store</CardTitle>
                <CardDescription>Distribution of products across all stores</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/products'}>
                View All Products
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : allProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No product data available</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-4">
                  {allStores.map((store, index) => {
                    const storeProducts = allProducts.filter(item => 
                      item.store?._id === store._id || item.storeId === store._id
                    );
                    
                    // Generate a light background color based on store index
                    const colors = [
                      'bg-blue-50', 'bg-green-50', 'bg-purple-50', 
                      'bg-amber-50', 'bg-pink-50', 'bg-teal-50'
                    ];
                    const textColors = [
                      'text-blue-600', 'text-green-600', 'text-purple-600', 
                      'text-amber-600', 'text-pink-600', 'text-teal-600'
                    ];
                    const bgColor = colors[index % colors.length];
                    const textColor = textColors[index % textColors.length];
                    
                    return (
                      <Card key={index} className={`${bgColor} border-0`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${bgColor.replace('50', '400')}`}></div>
                              <h3 className={`font-medium ${textColor}`}>{store.name}</h3>
                            </div>
                            <div className="text-2xl font-bold">{storeProducts.length}</div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {storeProducts.length > 0 
                              ? `${((storeProducts.length / allProducts.length) * 100).toFixed(1)}% of total products` 
                              : 'No products'}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                <div className="overflow-x-auto rounded-lg border mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left font-medium py-2 px-4">Product</th>
                        <th className="text-left font-medium py-2 px-4">Store</th>
                        <th className="text-left font-medium py-2 px-4">Category</th>
                        <th className="text-right font-medium py-2 px-4">Price</th>
                        <th className="text-left font-medium py-2 px-4">Toxicity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allProducts.slice(0, 10).map((product, index) => {
                        // Determine the store this product belongs to
                        const storeIndex = allStores.findIndex(s => 
                          s._id === product.store?._id || s._id === product.storeId
                        );
                        
                        const colors = [
                          'bg-blue-50', 'bg-green-50', 'bg-purple-50', 
                          'bg-amber-50', 'bg-pink-50', 'bg-teal-50'
                        ];
                        const bgColor = storeIndex >= 0 ? colors[storeIndex % colors.length] : 'bg-gray-50';
                        
                        return (
                          <tr key={index} className={`border-b hover:${bgColor}`}>
                            <td className="py-2 px-4 font-medium">{product.name}</td>
                            <td className="py-2 px-4">
                              <StoreBadge storeName={product.store?.name} />
                            </td>
                            <td className="py-2 px-4">{product.category || "Uncategorized"}</td>
                            <td className="py-2 px-4 text-right">₨ {product.price?.toLocaleString() || 0}</td>
                            <td className="py-2 px-4">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${
                                product.toxicityLevel === 'High' ? 'bg-red-100 text-red-800' : 
                                product.toxicityLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {product.toxicityLevel || 'Low'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Showing products from {allStores.length} stores
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Suppliers by Store */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <CardTitle>Suppliers by Store</CardTitle>
                <CardDescription>Distribution of suppliers across all stores</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/suppliers'}>
                View All Suppliers
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : allSuppliers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No supplier data available</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {allStores.map((store, index) => {
                    const storeSuppliers = allSuppliers.filter(item => 
                      item.store?._id === store._id || item.storeId === store._id
                    );
                    
                    // Generate a light background color based on store index
                    const colors = [
                      'bg-blue-50', 'bg-green-50', 'bg-purple-50', 
                      'bg-amber-50', 'bg-pink-50', 'bg-teal-50'
                    ];
                    const textColors = [
                      'text-blue-600', 'text-green-600', 'text-purple-600', 
                      'text-amber-600', 'text-pink-600', 'text-teal-600'
                    ];
                    const bgColor = colors[index % colors.length];
                    const textColor = textColors[index % textColors.length];
                    
                    return (
                      <Card key={index} className={`${bgColor} border-0`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${bgColor.replace('50', '400')}`}></div>
                              <h3 className={`font-medium text-sm ${textColor}`}>{store.name}</h3>
                            </div>
                            <div className="text-xl font-bold">{storeSuppliers.length}</div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {storeSuppliers.length > 0 
                              ? `${((storeSuppliers.length / allSuppliers.length) * 100).toFixed(1)}% of suppliers` 
                              : 'No suppliers'}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                <div className="overflow-x-auto rounded-lg border mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left font-medium py-2 px-4">Supplier</th>
                        <th className="text-left font-medium py-2 px-4">Store</th>
                        <th className="text-left font-medium py-2 px-4">Contact Person</th>
                        <th className="text-left font-medium py-2 px-4">Phone</th>
                        <th className="text-left font-medium py-2 px-4">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSuppliers.slice(0, 10).map((supplier, index) => {
                        // Determine the store this supplier belongs to
                        const storeIndex = allStores.findIndex(s => 
                          s._id === supplier.store?._id || s._id === supplier.storeId
                        );
                        
                        const colors = [
                          'bg-blue-50', 'bg-green-50', 'bg-purple-50', 
                          'bg-amber-50', 'bg-pink-50', 'bg-teal-50'
                        ];
                        const bgColor = storeIndex >= 0 ? colors[storeIndex % colors.length] : 'bg-gray-50';
                        
                        return (
                          <tr key={index} className={`border-b hover:${bgColor}`}>
                            <td className="py-2 px-4 font-medium">{supplier.name}</td>
                            <td className="py-2 px-4">
                              <StoreBadge storeName={supplier.store?.name} />
                            </td>
                            <td className="py-2 px-4">{supplier.contactPerson || "N/A"}</td>
                            <td className="py-2 px-4">{supplier.phone || "N/A"}</td>
                            <td className="py-2 px-4">{supplier.email || "N/A"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Showing suppliers from {allStores.length} stores
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Customers by Store */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <CardTitle>Customers by Store</CardTitle>
                <CardDescription>Distribution of customers across all stores</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/customers'}>
                View All Customers
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader className="h-8 w-8 animate-spin text-primary/70" />
              </div>
            ) : allCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No customer data available</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                  {allStores.map((store, index) => {
                    const storeCustomers = allCustomers.filter(item => 
                      item.store?._id === store._id || item.storeId === store._id
                    );
                    
                    // Generate a light background color based on store index
                    const colors = [
                      'bg-blue-50', 'bg-green-50', 'bg-purple-50', 
                      'bg-amber-50', 'bg-pink-50', 'bg-teal-50'
                    ];
                    const textColors = [
                      'text-blue-600', 'text-green-600', 'text-purple-600', 
                      'text-amber-600', 'text-pink-600', 'text-teal-600'
                    ];
                    const bgColor = colors[index % colors.length];
                    const textColor = textColors[index % textColors.length];
                    
                    return (
                      <Card key={index} className={`${bgColor} border-0`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${bgColor.replace('50', '400')}`}></div>
                              <h3 className={`font-medium text-sm ${textColor}`}>{store.name}</h3>
                            </div>
                            <div className="text-xl font-bold">{storeCustomers.length}</div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {storeCustomers.length > 0 
                              ? `${((storeCustomers.length / allCustomers.length) * 100).toFixed(1)}% of customers` 
                              : 'No customers'}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                <div className="overflow-x-auto rounded-lg border mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left font-medium py-2 px-4">Customer</th>
                        <th className="text-left font-medium py-2 px-4">Store</th>
                        <th className="text-left font-medium py-2 px-4">Phone</th>
                        <th className="text-left font-medium py-2 px-4">Email</th>
                        <th className="text-left font-medium py-2 px-4">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCustomers.slice(0, 10).map((customer, index) => {
                        // Determine the store this customer belongs to
                        const storeIndex = allStores.findIndex(s => 
                          s._id === customer.store?._id || s._id === customer.storeId
                        );
                        
                        const colors = [
                          'bg-blue-50', 'bg-green-50', 'bg-purple-50', 
                          'bg-amber-50', 'bg-pink-50', 'bg-teal-50'
                        ];
                        const bgColor = storeIndex >= 0 ? colors[storeIndex % colors.length] : 'bg-gray-50';
                        
                        return (
                          <tr key={index} className={`border-b hover:${bgColor}`}>
                            <td className="py-2 px-4 font-medium">{customer.name}</td>
                            <td className="py-2 px-4">
                              <StoreBadge storeName={customer.store?.name} />
                            </td>
                            <td className="py-2 px-4">{customer.phone || "N/A"}</td>
                            <td className="py-2 px-4">{customer.email || "N/A"}</td>
                            <td className="py-2 px-4">{customer.location || "N/A"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Showing customers from {allStores.length} stores
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get icon component based on name
const getIcon = (iconName) => {
  switch (iconName) {
    case 'Package':
      return <Package className="h-5 w-5" />;
    case 'AlertTriangle':
      return <AlertTriangle className="h-5 w-5" />;
    case 'DollarSign':
      return <DollarSign className="h-5 w-5" />;
    case 'ShoppingCart':
      return <ShoppingCart className="h-5 w-5" />;
    case 'Users':
      return <Users className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

export default Dashboard; 