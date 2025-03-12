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
      title: "Total Inventory Items",
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
      value: "$12,548",
      description: "Total revenue from sales",
      icon: <DollarSign className="h-5 w-5" />,
      iconClass: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
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
        label: 'Revenue ($)',
        data: [4500, 5200, 4800, 5800, 6000, 7200, 8500, 9200, 10000, 11500, 11000, 12500],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        order: 1,
      },
      {
        label: 'Expenses ($)',
        data: [3200, 3400, 3100, 3600, 3800, 4200, 4600, 5100, 5300, 5600, 5800, 6100],
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        fill: true,
        tension: 0.4,
        order: 2,
      },
      {
        label: 'Profit ($)',
        data: [1300, 1800, 1700, 2200, 2200, 3000, 3900, 4100, 4700, 5900, 5200, 6400],
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
        data: [4500, 5200, 4800, 5800, 6000, 7200],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Predicted Sales',
        data: [null, null, null, null, null, 7200, 7800, 8500, 9200, 10500, 11200, 12800],
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
    { id: 1, customer: "Green Farms Ltd", product: "MaxKill Insecticide", quantity: 20, total: 999.80, date: "Today, 10:15 AM" },
    { id: 2, customer: "City Parks Department", product: "HerbControl Plus", quantity: 15, total: 577.50, date: "Today, 9:30 AM" },
    { id: 3, customer: "Robert Greene", product: "FungoClear Solution", quantity: 5, total: 325.00, date: "Yesterday, 4:45 PM" },
    { id: 4, customer: "Sunrise Orchards", product: "AntiPest Powder", quantity: 10, total: 425.00, date: "Yesterday, 2:20 PM" },
    { id: 5, customer: "Community College", product: "RatAway Pellets", quantity: 8, total: 239.92, date: "Nov 15, 2023" },
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your pesticide inventory and business metrics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <div className="flex items-center rounded-md border px-3 py-2 bg-background text-sm">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent pr-8 focus:outline-none"
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
          
          <Button variant="outline" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statistics.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h2 className="text-2xl sm:text-3xl font-bold mt-1">{stat.value}</h2>
                  </div>
                  <div className={`p-2 rounded-full ${stat.iconClass}`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <div className={`mt-4 flex items-center text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              {/* Mini sparkline - would be dynamic in a real implementation */}
              <div className="h-12 bg-muted/30">
                <div className={`h-full w-full ${
                  stat.changeType === 'positive' 
                    ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900'
                    : 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900'
                }`}>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Business Performance</CardTitle>
              <CardDescription>Revenue, expenses and profit over time</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Monthly
              </Button>
              <Button variant="outline" size="sm">
                Quarterly
              </Button>
              <Button variant="outline" size="sm" className="bg-muted/50">
                Yearly
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[400px]">
              <Line data={salesData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
            <CardDescription>Breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Doughnut data={inventoryData} options={doughnutOptions} />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground">
              View Detailed Inventory Report
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segmentation</CardTitle>
            <CardDescription>Sales distribution by customer type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Pie data={customerSegmentData} options={doughnutOptions} />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground">
              View Customer Analytics
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Sales Forecast */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-0">
          <div>
            <CardTitle>6-Month Sales Forecast</CardTitle>
            <CardDescription>Predicted sales based on historical data</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="mt-4 sm:mt-0">
            <Filter className="mr-2 h-4 w-4" />
            Adjust Parameters
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
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
                    <td className="py-3 font-medium">${sale.total.toFixed(2)}</td>
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