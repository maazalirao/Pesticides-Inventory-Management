"// Creating admin dashboard file" 

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
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
  getAdminDashboardStats, 
  getAllStoresProducts,
  getAllStoresInventory,
  getAllStoresSuppliers,
  getAllStoresCustomers
} from '../../lib/api.js';

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

const Dashboard = () => {
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
  
  // New state for global data
  const [allProducts, setAllProducts] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allStores, setAllStores] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch global data from all stores
        const [dashboardStats, products, inventory, suppliers, customers] = await Promise.all([
          getAdminDashboardStats(),
          getAllStoresProducts(),
          getAllStoresInventory(),
          getAllStoresSuppliers(),
          getAllStoresCustomers()
        ]);
        
        // Process and set dashboard stats
        if (dashboardStats) {
          // Set statistics
          if (dashboardStats.statistics) {
            setStatistics(dashboardStats.statistics);
          }
          
          // Set sales data
          if (dashboardStats.salesData) {
            setSalesData(dashboardStats.salesData);
          }
          
          // Set inventory distribution
          if (dashboardStats.inventoryDistribution) {
            setInventoryData(dashboardStats.inventoryDistribution);
          }
          
          // Set customer segments
          if (dashboardStats.customerSegments) {
            setCustomerSegmentData(dashboardStats.customerSegments);
          }
          
          // Set sales forecast
          if (dashboardStats.salesForecast) {
            setForecastData(dashboardStats.salesForecast);
          }
          
          // Set low stock products
          if (dashboardStats.lowStockProducts) {
            setLowStockProducts(dashboardStats.lowStockProducts);
          }
          
          // Set expiring products
          if (dashboardStats.expiringProducts) {
            setExpiringProducts(dashboardStats.expiringProducts);
          }
          
          // Set recent sales
          if (dashboardStats.recentSales) {
            setRecentSales(dashboardStats.recentSales);
          }
          
          // Set stores data
          if (dashboardStats.stores) {
            setAllStores(dashboardStats.stores);
          }
        }
        
        // Set global data
        setAllProducts(products || []);
        setAllInventory(inventory || []);
        setAllSuppliers(suppliers || []);
        setAllCustomers(customers || []);
        
        // If no real data yet, use mock data
        if (!dashboardStats || !dashboardStats.statistics) {
          // Mock statistics (as a fallback)
          const statsData = [
            {
              title: "Inventory Items",
              value: "1,256",
              description: "Total pesticide products in stock",
              icon: "Package",
              iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
              change: "+5% from last month",
              changeType: "positive"
            },
            {
              title: "Low Stock Alerts",
              value: "32",
              description: "Products below minimum threshold",
              icon: "AlertTriangle",
              iconClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
              change: "-12% since last week",
              changeType: "positive"
            },
            {
              title: "Sales This Month",
              value: "₨ 854,120",
              description: "Total revenue from sales",
              icon: "DollarSign",
              iconClass: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
              change: "+8% from last month",
              changeType: "positive"
            },
            {
              title: "New Orders",
              value: "125",
              description: "Orders received today",
              icon: "ShoppingCart",
              iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
              change: "+15% from yesterday",
              changeType: "positive"
            }
          ];
          
          // Mock sales data
          const salesChartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                label: 'Revenue',
                data: [432000, 468000, 513000, 481000, 557000, 602000, 574000, 623000, 651000, 698000, 742000, 854120],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Expenses',
                data: [310000, 321000, 356000, 339000, 376000, 392000, 401000, 412000, 424000, 446000, 473000, 513000],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: 'Profit',
                data: [122000, 147000, 157000, 142000, 181000, 210000, 173000, 211000, 227000, 252000, 269000, 341120],
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
              }
            ]
          };
          
          // Mock inventory distribution
          const inventoryChartData = {
            labels: ['Insecticides', 'Herbicides', 'Fungicides', 'Rodenticides', 'Fertilizers'],
            datasets: [
              {
                data: [40, 25, 15, 10, 10],
                backgroundColor: [
                  'rgba(249, 115, 22, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(99, 102, 241, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(239, 68, 68, 0.7)'
                ],
                borderWidth: 1
              }
            ]
          };
          
          // Mock customer segments
          const customerSegmentsData = {
            labels: ['Large Farms', 'Small Farms', 'Agricultural Co-ops', 'Retail Stores', 'Individual Consumers'],
            datasets: [
              {
                data: [35, 20, 25, 15, 5],
                backgroundColor: [
                  'rgba(249, 115, 22, 0.7)',
                  'rgba(16, 185, 129, 0.7)',
                  'rgba(99, 102, 241, 0.7)',
                  'rgba(245, 158, 11, 0.7)',
                  'rgba(239, 68, 68, 0.7)'
                ],
                borderWidth: 1
              }
            ]
          };
          
          // Mock forecast data
          const forecastChartData = {
            labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            datasets: [
              {
                label: 'Actual Sales',
                data: [623000, 651000, 698000, 742000, 854120, null],
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
                fill: false
              },
              {
                label: 'Forecast',
                data: [623000, 651000, 698000, 742000, 854120, 912000],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                borderDash: [5, 5],
                fill: false
              }
            ]
          };
          
          // Mock expiring products
          const expiringProductsData = [
            { id: 1, name: 'BioSafe Insecticide Pro', stock: 45, expiryDate: '2023-09-15' },
            { id: 2, name: 'EcoDefense Herbicide', stock: 32, expiryDate: '2023-09-22' },
            { id: 3, name: 'NaturGuard Fungicide', stock: 18, expiryDate: '2023-10-05' },
            { id: 4, name: 'SafeHarvest Pesticide', stock: 24, expiryDate: '2023-10-12' }
          ];
          
          // Mock low stock products
          const lowStockData = [
            { id: 1, name: 'CropSaver Ultra', stock: 5, threshold: 10 },
            { id: 2, name: 'WeedControl Bio', stock: 8, threshold: 15 },
            { id: 3, name: 'PestShield Max', stock: 3, threshold: 12 },
            { id: 4, name: 'PlantProtect Solution', stock: 6, threshold: 10 }
          ];
          
          // Mock recent sales
          const recentSalesData = [
            { id: 1, customer: 'Green Valley Farms', product: 'BioSafe Insecticide Pro', quantity: 10, date: '2023-07-24', total: 45600 },
            { id: 2, customer: 'Sunrise Agricultural Co-op', product: 'EcoDefense Herbicide', quantity: 15, date: '2023-07-23', total: 25800 },
            { id: 3, customer: 'Golden Harvest Supplies', product: 'NaturGuard Fungicide', quantity: 8, date: '2023-07-23', total: 19200 },
            { id: 4, customer: 'Blue Sky Organics', product: 'CropSaver Ultra', quantity: 12, date: '2023-07-22', total: 36000 }
          ];
          
          // Set the data state
          setStatistics(statsData);
          setSalesData(salesChartData);
          setInventoryData(inventoryChartData);
          setCustomerSegmentData(customerSegmentsData);
          setForecastData(forecastChartData);
          setExpiringProducts(expiringProductsData);
          setLowStockProducts(lowStockData);
          setRecentSales(recentSalesData);
          
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setError('Failed to fetch dashboard data. Please try again later.');
          
          // Set mock data as fallback
          // ...
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
  }, [timeRange, category]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    // Refetch data
    const timeRangeValue = timeRange;
    setTimeRange('temp');
    setTimeout(() => setTimeRange(timeRangeValue), 10);
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
        {statistics.map((stat, index) => (
          <Card key={index} className="overflow-hidden relative">
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
                  stat.changeType === 'positive' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
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
            <div className={`absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 ${
              stat.changeType === 'positive' 
                ? 'bg-gradient-to-r from-orange-200 to-orange-500 dark:from-orange-900 dark:to-orange-600'
                : 'bg-gradient-to-r from-red-200 to-red-500 dark:from-red-900 dark:to-red-600'
            }`}></div>
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
              <Line data={salesData} options={chartOptions} />
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
              <Doughnut data={inventoryData} options={doughnutOptions} />
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
              <Pie data={customerSegmentData} options={doughnutOptions} />
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
            <Line data={forecastData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Tables section */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {/* Expiring Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-500" />
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
                        <span className="text-xs text-red-500">Expires: {new Date(product.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs">View</Button>
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
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
                        <span className="text-xs text-red-500">Stock: {product.stock}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">Threshold: {product.threshold}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 text-xs">Restock</Button>
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
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-green-500" />
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