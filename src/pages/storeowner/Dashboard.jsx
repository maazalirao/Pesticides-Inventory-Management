"// Creating admin dashboard file" 

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
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
  ChevronDown
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
  getDashboardStats, 
  getSalesData, 
  getInventoryDistribution, 
  getCustomerSegments,
  getSalesForecast,
  getLowStockProducts,
  getExpiringProducts,
  getRecentSales,
  clearAnalyticsCache
} from '../../lib/api.js';
import { 
  getMockDashboardStats,
  getMockSalesData,
  getMockInventoryDistribution
} from '../../lib/mockData';

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

// Safe chart components with validation
const SafeLineChart = ({ data, options }) => {
  // Validate data has proper structure before rendering
  if (!data || !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  return <Line data={data} options={options} />;
};

const SafeDoughnutChart = ({ data, options }) => {
  // Validate data has proper structure before rendering
  if (!data || !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  return <Doughnut data={data} options={options} />;
};

const SafePieChart = ({ data, options }) => {
  // Validate data has proper structure before rendering
  if (!data || !data.datasets || !Array.isArray(data.datasets) || data.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }
  
  return <Pie data={data} options={options} />;
};

const Dashboard = () => {
  const { adminUser, isStoreOwner, selectedStore, isLoading } = useAdminAuth();
  const navigate = useNavigate();
  
  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Auto navigation and store selection logic
  useEffect(() => {
    if (isLoading) return; // Wait for loading to complete
    
    if (adminUser && adminUser.stores?.length > 1 && !selectedStore) {
      navigate('/select-store');
    } else if (adminUser && adminUser.stores?.length === 1 && !selectedStore) {
      // Auto-select the single store if not already selected
      console.log('Auto-selecting single store for user');
    }
  }, [adminUser, selectedStore, navigate, isLoading]);
  
  // If no store is available, show error
  if (!selectedStore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Store Selected</h2>
          <p className="text-gray-600 mb-4">Please select a store to manage.</p>
          <Button onClick={() => navigate('/select-store')}>
            Select Store
          </Button>
        </div>
      </div>
    );
  }
  // State for dashboard filters and data
  const [timeRange, setTimeRange] = useState('year');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for API data
  const [statistics, setStatistics] = useState([]);
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

  // Simple cache for store owner dashboard
  const [dashboardCache, setDashboardCache] = useState(null);
  const [cacheTime, setCacheTime] = useState(0);

  // Fetch essential data only
  useEffect(() => {
    if (!selectedStore) {
      console.log("No store selected, skipping dashboard data fetch");
      return;
    }
    
    const fetchEssentialData = async () => {
      // Check cache first (5 minute expiry)
      if (dashboardCache && (Date.now() - cacheTime < 5 * 60 * 1000)) {
        console.log("Using cached store owner dashboard data");
        setStatistics(dashboardCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching essential dashboard data...");
        
        // Only fetch essential stats first
        const dashboardStats = await getDashboardStats();
        console.log("Dashboard stats:", dashboardStats);
        
        if (dashboardStats) {
          const statsArray = Object.keys(dashboardStats).map(key => {
            return {
              ...dashboardStats[key],
              id: key
            };
          });
          setStatistics(statsArray);
          
          // Cache the data
          setDashboardCache(statsArray);
          setCacheTime(Date.now());
        } else {
          setStatistics([]);
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        console.log('Loading mock data for store owner dashboard as fallback...');
        
        // Use mock data as fallback
        const mockStats = getMockDashboardStats();
        setStatistics(mockStats);
        
        // Cache the mock data
        setDashboardCache(mockStats);
        setCacheTime(Date.now());
        
        setError('Using demo data - API connection failed.');
        setLoading(false);
      }
    };

    fetchEssentialData();
  }, [selectedStore]);

  // Load additional data for charts when stats are ready
  useEffect(() => {
    if (statistics.length === 0) return;

    const loadChartsData = async () => {
      try {
        // Get simple sales data with fallback to mock data
        try {
          const salesDataResponse = await getSalesData(timeRange);
          setSalesData(salesDataResponse || getMockSalesData());
        } catch (err) {
          console.log('Using mock sales data as fallback');
          setSalesData(getMockSalesData());
        }

        // Use mock inventory distribution data with fallback
        try {
          const inventoryDataResponse = await getInventoryDistribution();
          setInventoryData(inventoryDataResponse || getMockInventoryDistribution());
        } catch (err) {
          console.log('Using mock inventory data as fallback');
          setInventoryData(getMockInventoryDistribution());
        }

        setCustomerSegmentData({
          labels: ['Regular', 'Premium', 'New'],
          datasets: [{
            data: [50, 30, 20],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
          }]
        });

                 setForecastData({
           labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
           datasets: [{
             label: 'Projected Sales',
             data: [32, 35, 28, 40, 38, 45],
             borderColor: 'rgb(59, 130, 246)',
             backgroundColor: 'rgba(59, 130, 246, 0.1)',
             borderDash: [5, 5],
           }]
         });

         // Load table data
         const lowStockData = await getLowStockProducts();
         setLowStockProducts(lowStockData || []);
         
         const expiringData = await getExpiringProducts();
         setExpiringProducts(expiringData || []);
         
         const recentSalesData = await getRecentSales();
         setRecentSales(recentSalesData || []);

       } catch (error) {
         console.error('Error loading charts data:', error);
       }
    };

    // Load charts after a short delay
    setTimeout(loadChartsData, 500);
  }, [statistics, timeRange]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    console.log("Refreshing dashboard data...");
    
    // Clear cache and reload
    setDashboardCache(null);
    setCacheTime(0);
    
    setLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 100);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center rounded-md border">
            <Button 
              variant={timeRange === 'week' ? 'secondary' : 'ghost'} 
              className="text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => handleTimeRangeChange('week')}
            >
              Weekly
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'secondary' : 'ghost'} 
              className="text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => handleTimeRangeChange('month')}
            >
              Monthly
            </Button>
            <Button 
              variant={timeRange === 'year' ? 'secondary' : 'ghost'} 
              className="text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => handleTimeRangeChange('year')}
            >
              Yearly
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
        {statistics.map((stat) => (
          <Card key={stat.id} className="overflow-hidden relative">
            <CardContent className="p-0">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1">{stat.value}</h2>
                  </div>
                  <div className={`p-1.5 sm:p-2 rounded-full ${stat.iconClass}`}>
                    {getIcon(stat.icon)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{stat.description}</p>
                <div className={`mt-2 sm:mt-4 flex items-center text-xs ${
                  stat.changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
            </CardContent>
            
            {/* Bottom color indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-emerald-200 to-emerald-500 dark:from-emerald-900 dark:to-emerald-600"></div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
            <div>
              <CardTitle>Business Performance</CardTitle>
              <CardDescription>Revenue, expenses and profit over time</CardDescription>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button 
                variant={timeRange === 'month' ? 'secondary' : 'outline'} 
                size="sm" 
                className="h-7 px-2 sm:px-3 text-xs"
                onClick={() => handleTimeRangeChange('month')}
              >
                Monthly
              </Button>
              <Button 
                variant={timeRange === 'quarter' ? 'secondary' : 'outline'} 
                size="sm" 
                className="h-7 px-2 sm:px-3 text-xs"
                onClick={() => handleTimeRangeChange('quarter')}
              >
                Quarterly
              </Button>
              <Button 
                variant={timeRange === 'year' ? 'secondary' : 'outline'} 
                size="sm" 
                className="h-7 px-2 sm:px-3 text-xs"
                onClick={() => handleTimeRangeChange('year')}
              >
                Yearly
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] md:h-[400px]">
              <SafeLineChart data={salesData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Inventory Distribution</CardTitle>
            <CardDescription>Breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <SafeDoughnutChart data={inventoryData} options={doughnutOptions} />
            </div>
          </CardContent>
          <CardFooter className="border-t px-3 sm:px-6 py-2 sm:py-3">
            <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground">
              View Detailed Inventory Report
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg">Customer Segmentation</CardTitle>
            <CardDescription>Sales distribution by customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <SafePieChart data={customerSegmentData} options={doughnutOptions} />
            </div>
          </CardContent>
          <CardFooter className="border-t px-3 sm:px-6 py-2 sm:py-3">
            <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground">
              View Customer Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Sales Forecast */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-base sm:text-lg">6-Month Sales Forecast</CardTitle>
            <CardDescription>Predicted sales based on historical data</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Adjust Parameters</span>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px]">
            <SafeLineChart data={forecastData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Tables section */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* Expiring Products */}
        <Card className="border-emerald-100 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-emerald-500" />
              Expiring Products
            </CardTitle>
            <CardDescription>Products expiring in next 60 days</CardDescription>
          </CardHeader>
          <CardContent>
            {expiringProducts.length > 0 ? (
              <div className="space-y-4">
                {expiringProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-xs text-emerald-500">Expires: {new Date(product.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600">View</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No expiring products</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-emerald-100 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-emerald-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products below minimum threshold</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-emerald-500">Stock: {product.stock}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">Threshold: {product.threshold}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600">Restock</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No low stock alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="md:col-span-2 xl:col-span-1 border-emerald-100 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-emerald-500" />
              Recent Sales
            </CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length > 0 ? (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{sale.customer}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center mt-1">
                        <span className="text-xs text-muted-foreground">{sale.product} x{sale.quantity}</span>
                        <span className="hidden sm:block mx-2 text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{sale.date}</span>
                      </div>
                    </div>
                    <span className="font-medium text-sm">{formatCurrency(sale.total)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No recent sales</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button variant="ghost" className="w-full justify-center text-xs">
              View All Sales
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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