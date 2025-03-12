import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Users,
  ShoppingCart,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  ChevronDown,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
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
  // State for dashboard filters
  const [timeRange, setTimeRange] = useState('month');
  const [category, setCategory] = useState('all');
  
  // Mock data for statistics
  const statistics = [
    {
      title: "Inventory Items",
      value: "248",
      description: "Total pesticide products in stock",
      icon: <Package className="h-5 w-5" />,
      iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
      change: "+12% from last month",
      changeType: "positive"
    },
    {
      title: "Low Stock Alerts",
      value: "18",
      description: "Products below minimum threshold",
      icon: <AlertTriangle className="h-5 w-5" />,
      iconClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
      change: "+5 since last week",
      changeType: "negative"
    },
    {
      title: "Sales This Month",
      value: "12,800",
      description: "Total revenue from sales",
      icon: <DollarSign className="h-5 w-5" />,
      iconClass: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
      change: "+18% from last month",
      changeType: "positive"
    },
    {
      title: "New Orders",
      value: "24",
      description: "Orders received today",
      icon: <ShoppingCart className="h-5 w-5" />,
      iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
      change: "+4 from yesterday",
      changeType: "positive"
    }
  ];

  // Mock data for sales chart - now with more detailed data
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue (₨)',
        data: [450000, 520000, 480000, 580000, 600000, 720000, 850000, 920000, 1000000, 1150000, 1100000, 1250000],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        order: 1,
      },
      {
        label: 'Expenses (₨)',
        data: [320000, 340000, 310000, 360000, 380000, 420000, 460000, 510000, 530000, 560000, 580000, 610000],
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        fill: true,
        tension: 0.4,
        order: 2,
      },
      {
        label: 'Profit (₨)',
        data: [130000, 180000, 170000, 220000, 220000, 300000, 390000, 410000, 470000, 590000, 520000, 640000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        type: 'line',
        order: 0,
      }
    ],
  };

  // Mock data for inventory distribution
  const inventoryData = {
    labels: ['Insecticides', 'Herbicides', 'Fungicides', 'Rodenticides', 'Others'],
    datasets: [
      {
        label: 'Inventory Distribution',
        data: [120, 80, 40, 25, 15],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(100, 116, 139, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(100, 116, 139, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // New chart: Sales by customer segment
  const customerSegmentData = {
    labels: ['Agriculture', 'Commercial', 'Government', 'Residential', 'Educational'],
    datasets: [
      {
        label: 'Sales by Customer Segment',
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(100, 116, 139, 0.7)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(100, 116, 139, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // New chart: Sales forecast
  const forecastData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Actual Sales',
        data: [450000, 520000, 480000, 580000, 600000, 720000],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Predicted Sales',
        data: [null, null, null, null, null, 720000, 780000, 850000, 920000, 1050000, 1120000, 1280000],
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Mock data for expiring products
  const expiringProducts = [
    { id: 1, name: "MaxKill Insecticide", stock: 45, expiryDate: "2023-12-15" },
    { id: 2, name: "HerbControl Plus", stock: 28, expiryDate: "2023-12-20" },
    { id: 3, name: "FungoClear Solution", stock: 16, expiryDate: "2023-12-28" },
    { id: 4, name: "RatAway Pellets", stock: 34, expiryDate: "2024-01-05" },
    { id: 5, name: "AntiPest Powder", stock: 22, expiryDate: "2024-01-10" },
  ];

  // Mock data for low stock alerts
  const lowStockProducts = [
    { id: 1, name: "MaxKill Insecticide", stock: 5, threshold: 10 },
    { id: 2, name: "GardenGuard Spray", stock: 3, threshold: 15 },
    { id: 3, name: "TermiteShield", stock: 2, threshold: 8 },
    { id: 4, name: "MosquitoKiller", stock: 4, threshold: 12 },
    { id: 5, name: "WeedBGone", stock: 6, threshold: 10 },
  ];

  // Mock data for recent sales
  const recentSales = [
    { id: 1, customer: "Al-Barakat Farms", product: "MaxKill Insecticide", quantity: 20, total: 99980, date: "Today, 10:15 AM" },
    { id: 2, customer: "City Parks Authority", product: "HerbControl Plus", quantity: 15, total: 57750, date: "Today, 9:30 AM" },
    { id: 3, customer: "Maaz Ali", product: "FungoClear Solution", quantity: 5, total: 32500, date: "Yesterday, 4:45 PM" },
    { id: 4, customer: "Rehman Orchards", product: "AntiPest Powder", quantity: 10, total: 42500, date: "Yesterday, 2:20 PM" },
    { id: 5, customer: "Agriculture University", product: "RatAway Pellets", quantity: 8, total: 23992, date: "Nov 15, 2023" },
  ];

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="hidden md:block text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="hidden md:block text-muted-foreground">
            Overview of your pesticide inventory and business metrics
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[120px]">
            <div className="flex items-center rounded-md border px-3 py-2 bg-background text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent pr-8 focus:outline-none text-xs sm:text-sm"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:inline">Refresh</span>
          </Button>
          
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:inline">Export</span>
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
                    {stat.icon}
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
              <Button variant="outline" size="sm" className="h-7 px-2 sm:px-3 text-xs">
                Monthly
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 sm:px-3 text-xs">
                Quarterly
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 sm:px-3 text-xs bg-muted/50">
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

      {/* Alerts and notifications */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
              Products Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Product Name</th>
                    <th className="py-3 text-left font-medium">Stock</th>
                    <th className="py-3 text-left font-medium">Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3">{product.stock} units</td>
                      <td className="py-3 text-yellow-600 dark:text-yellow-400 font-medium">{product.expiryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground">
              View All Expiring Products
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium">Product Name</th>
                    <th className="py-3 text-left font-medium">Current Stock</th>
                    <th className="py-3 text-left font-medium">Threshold</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3 text-red-600 dark:text-red-400 font-medium">{product.stock} units</td>
                      <td className="py-3">{product.threshold} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground">
              View All Low Stock Items
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
            Recent Sales
          </CardTitle>
          <CardDescription>Latest transactions from your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium">Customer</th>
                  <th className="py-3 text-left font-medium">Product</th>
                  <th className="py-3 text-left font-medium">Quantity</th>
                  <th className="py-3 text-left font-medium">Total</th>
                  <th className="py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 font-medium">{sale.customer}</td>
                    <td className="py-3">{sale.product}</td>
                    <td className="py-3">{sale.quantity}</td>
                    <td className="py-3 font-medium">{formatCurrency(sale.total)}</td>
                    <td className="py-3 text-muted-foreground">{sale.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="border-t flex justify-between">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Sales
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            View All Sales
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard; 