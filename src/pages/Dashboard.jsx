import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Users,
  ShoppingCart
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // Mock data for statistics
  const statistics = [
    {
      title: "Total Inventory Items",
      value: "248",
      description: "Total pesticide products in stock",
      icon: <Package className="h-5 w-5" />,
      iconClass: "bg-blue-100 text-blue-600",
      change: "+12% from last month",
      changeType: "positive"
    },
    {
      title: "Low Stock Alerts",
      value: "18",
      description: "Products below minimum threshold",
      icon: <AlertTriangle className="h-5 w-5" />,
      iconClass: "bg-yellow-100 text-yellow-600",
      change: "+5 since last week",
      changeType: "negative"
    },
    {
      title: "Sales This Month",
      value: "$12,548",
      description: "Total revenue from sales",
      icon: <DollarSign className="h-5 w-5" />,
      iconClass: "bg-green-100 text-green-600",
      change: "+18% from last month",
      changeType: "positive"
    },
    {
      title: "New Orders",
      value: "24",
      description: "Orders received today",
      icon: <ShoppingCart className="h-5 w-5" />,
      iconClass: "bg-purple-100 text-purple-600",
      change: "+4 from yesterday",
      changeType: "positive"
    }
  ];

  // Mock data for sales chart
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Sales ($)',
        data: [4500, 5200, 4800, 5800, 6000, 7200, 8500, 9200, 10000, 11500, 11000, 12500],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
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
          'hsl(var(--primary) / 0.8)',
          'hsl(var(--primary) / 0.6)',
          'hsl(var(--primary) / 0.4)',
          'hsl(var(--primary) / 0.3)',
          'hsl(var(--primary) / 0.2)',
        ],
        borderColor: [
          'hsl(var(--primary))',
          'hsl(var(--primary))',
          'hsl(var(--primary))',
          'hsl(var(--primary))',
          'hsl(var(--primary))',
        ],
        borderWidth: 1,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your pesticide inventory and business metrics
        </p>
      </div>

      {/* Statistics cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statistics.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h2 className="text-3xl font-bold">{stat.value}</h2>
                </div>
                <div className={`p-2 rounded-full ${stat.iconClass}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <div className={`mt-4 flex items-center text-xs ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <AlertTriangle className="mr-1 h-3 w-3" />
                )}
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
              <Bar data={inventoryData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <tr key={product.id} className="border-b">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3">{product.stock} units</td>
                      <td className="py-3 text-yellow-600 font-medium">{product.expiryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
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
                    <tr key={product.id} className="border-b">
                      <td className="py-3">{product.name}</td>
                      <td className="py-3 text-red-600 font-medium">{product.stock} units</td>
                      <td className="py-3">{product.threshold} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 