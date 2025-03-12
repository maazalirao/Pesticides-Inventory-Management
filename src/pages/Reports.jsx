import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  DollarSign
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
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('monthly');

  // Mock data for sales report
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [4500, 5200, 4800, 5800, 6000, 7200, 8500, 9200, 10000, 11500, 11000, 12500],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expenses ($)',
        data: [3800, 4500, 4200, 5100, 5300, 6200, 7400, 8000, 8800, 9500, 9200, 10200],
        borderColor: 'hsl(var(--destructive))',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  // Mock data for inventory report
  const inventoryData = {
    labels: ['Insecticides', 'Herbicides', 'Fungicides', 'Rodenticides', 'Others'],
    datasets: [
      {
        label: 'Inventory Distribution',
        data: [120, 80, 40, 25, 15],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(156, 163, 175, 0.7)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for product sales report
  const productSalesData = {
    labels: ['MaxKill', 'HerbControl', 'FungoClear', 'RatAway', 'AntiPest', 'WeedBGone', 'TermiteShield', 'MosquitoKiller', 'AntControl', 'MoldBuster'],
    datasets: [
      {
        label: 'Units Sold',
        data: [120, 95, 65, 45, 55, 80, 30, 40, 70, 50],
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Mock data for customer distribution
  const customerData = {
    labels: ['Business', 'Individual', 'Government', 'Educational'],
    datasets: [
      {
        label: 'Customer Distribution',
        data: [45, 30, 15, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(249, 115, 22, 0.7)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for low stock and expiry alerts
  const lowStockProducts = [
    { id: 1, name: "MaxKill Insecticide", stock: 5, threshold: 10 },
    { id: 2, name: "GardenGuard Spray", stock: 3, threshold: 15 },
    { id: 3, name: "TermiteShield", stock: 2, threshold: 8 },
    { id: 4, name: "MosquitoKiller", stock: 4, threshold: 12 },
    { id: 5, name: "WeedBGone", stock: 6, threshold: 10 },
  ];

  const expiringProducts = [
    { id: 1, name: "MaxKill Insecticide", stock: 45, expiryDate: "2023-12-15" },
    { id: 2, name: "HerbControl Plus", stock: 28, expiryDate: "2023-12-20" },
    { id: 3, name: "FungoClear Solution", stock: 16, expiryDate: "2023-12-28" },
    { id: 4, name: "RatAway Pellets", stock: 34, expiryDate: "2024-01-05" },
    { id: 5, name: "AntiPest Powder", stock: 22, expiryDate: "2024-01-10" },
  ];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false,
      },
    },
  };

  // KPI summary data
  const kpis = [
    {
      title: "Total Sales",
      value: "$96,250",
      change: "+12.5%",
      changeType: "positive",
      icon: <DollarSign className="h-5 w-5" />,
      iconClass: "bg-green-100 text-green-600",
    },
    {
      title: "Profit Margin",
      value: "24.8%",
      change: "+2.3%",
      changeType: "positive",
      icon: <TrendingUp className="h-5 w-5" />,
      iconClass: "bg-blue-100 text-blue-600",
    },
    {
      title: "Low Stock Items",
      value: "18",
      change: "+5",
      changeType: "negative",
      icon: <AlertTriangle className="h-5 w-5" />,
      iconClass: "bg-yellow-100 text-yellow-600",
    },
    {
      title: "Expiring Items",
      value: "23",
      change: "-2",
      changeType: "positive",
      icon: <Package className="h-5 w-5" />,
      iconClass: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="hidden md:block text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="hidden md:block text-muted-foreground">
            Analyze your business performance with detailed reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-md">
            <button
              className={`px-3 py-1.5 text-sm ${dateRange === 'weekly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              onClick={() => setDateRange('weekly')}
            >
              Weekly
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${dateRange === 'monthly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              onClick={() => setDateRange('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-3 py-1.5 text-sm ${dateRange === 'yearly' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              onClick={() => setDateRange('yearly')}
            >
              Yearly
            </button>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <h2 className="text-3xl font-bold">{kpi.value}</h2>
                </div>
                <div className={`p-2 rounded-full ${kpi.iconClass}`}>
                  {kpi.icon}
                </div>
              </div>
              <div className={`mt-4 flex items-center text-xs ${
                kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.changeType === 'positive' ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                <span>{kpi.change} from previous period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Type Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            reportType === 'sales'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setReportType('sales')}
        >
          Sales Report
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            reportType === 'inventory'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setReportType('inventory')}
        >
          Inventory Report
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            reportType === 'products'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setReportType('products')}
        >
          Product Sales
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            reportType === 'customers'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setReportType('customers')}
        >
          Customer Analysis
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            reportType === 'alerts'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setReportType('alerts')}
        >
          Stock Alerts
        </button>
      </div>

      {/* Report Content */}
      <div className="grid gap-6">
        {reportType === 'sales' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Monthly sales and expenses overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Line data={salesData} options={lineChartOptions} />
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Distribution of sales across product categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Doughnut data={inventoryData} options={pieChartOptions} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Products with highest sales volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar 
                      data={{
                        labels: productSalesData.labels.slice(0, 5),
                        datasets: [{
                          ...productSalesData.datasets[0],
                          data: productSalesData.datasets[0].data.slice(0, 5)
                        }]
                      }} 
                      options={barChartOptions} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {reportType === 'inventory' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Inventory Distribution</CardTitle>
                <CardDescription>Current stock levels by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <div className="w-2/3">
                    <Pie data={inventoryData} options={pieChartOptions} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movement</CardTitle>
                  <CardDescription>Monthly inventory changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line 
                      data={{
                        labels: salesData.labels,
                        datasets: [{
                          label: 'Inventory In',
                          data: [120, 150, 130, 160, 140, 180, 200, 190, 210, 230, 220, 240],
                          borderColor: 'rgba(34, 197, 94, 1)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          fill: true,
                        },
                        {
                          label: 'Inventory Out',
                          data: [100, 130, 110, 140, 120, 150, 170, 160, 180, 200, 190, 210],
                          borderColor: 'rgba(239, 68, 68, 1)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          fill: true,
                        }]
                      }} 
                      options={lineChartOptions} 
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Storage Utilization</CardTitle>
                  <CardDescription>Warehouse space utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar 
                      data={{
                        labels: ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D'],
                        datasets: [{
                          label: 'Used Capacity (%)',
                          data: [85, 65, 72, 54],
                          backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(249, 115, 22, 0.7)',
                            'rgba(34, 197, 94, 0.7)',
                          ],
                        }]
                      }} 
                      options={barChartOptions} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {reportType === 'products' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Product Sales Comparison</CardTitle>
                <CardDescription>Sales volume by product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Bar data={productSalesData} options={barChartOptions} />
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Seasonal Product Trends</CardTitle>
                  <CardDescription>Product sales by season</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [
                          {
                            label: 'Insecticides',
                            data: [45, 50, 60, 75, 85, 95, 100, 90, 80, 70, 55, 40],
                            borderColor: 'rgba(34, 197, 94, 1)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                          },
                          {
                            label: 'Herbicides',
                            data: [80, 70, 65, 70, 85, 95, 90, 80, 75, 85, 95, 90],
                            borderColor: 'rgba(59, 130, 246, 1)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                          },
                          {
                            label: 'Fungicides',
                            data: [30, 35, 45, 60, 70, 75, 60, 50, 45, 40, 35, 30],
                            borderColor: 'rgba(168, 85, 247, 1)',
                            backgroundColor: 'rgba(168, 85, 247, 0.1)',
                            tension: 0.4,
                          }
                        ]
                      }} 
                      options={lineChartOptions} 
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Product Profitability</CardTitle>
                  <CardDescription>Profit margin by product category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar 
                      data={{
                        labels: ['Insecticides', 'Herbicides', 'Fungicides', 'Rodenticides', 'Others'],
                        datasets: [{
                          label: 'Profit Margin (%)',
                          data: [32, 28, 25, 35, 22],
                          backgroundColor: [
                            'rgba(34, 197, 94, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(168, 85, 247, 0.7)',
                            'rgba(249, 115, 22, 0.7)',
                            'rgba(156, 163, 175, 0.7)',
                          ],
                        }]
                      }} 
                      options={barChartOptions} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {reportType === 'customers' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
                <CardDescription>Customer types and their sales contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center">
                  <div className="w-2/3">
                    <Doughnut data={customerData} options={pieChartOptions} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Acquisition</CardTitle>
                  <CardDescription>New customers by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Line 
                      data={{
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        datasets: [{
                          label: 'New Customers',
                          data: [12, 15, 10, 18, 22, 25, 20, 28, 32, 35, 30, 38],
                          borderColor: 'rgba(34, 197, 94, 1)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          fill: true,
                          tension: 0.4,
                        }]
                      }} 
                      options={lineChartOptions} 
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Customer Spending</CardTitle>
                  <CardDescription>Average purchase value by customer type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar 
                      data={{
                        labels: ['Business', 'Individual', 'Government', 'Educational'],
                        datasets: [{
                          label: 'Avg. Purchase Value ($)',
                          data: [2500, 350, 4500, 1800],
                          backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(168, 85, 247, 0.7)',
                            'rgba(34, 197, 94, 0.7)',
                            'rgba(249, 115, 22, 0.7)',
                          ],
                        }]
                      }} 
                      options={barChartOptions} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {reportType === 'alerts' && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    Low Stock Products
                  </CardTitle>
                  <CardDescription>Products below minimum threshold</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 text-left font-medium">Product Name</th>
                          <th className="py-3 text-left font-medium">Current Stock</th>
                          <th className="py-3 text-left font-medium">Threshold</th>
                          <th className="py-3 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="py-3">{product.name}</td>
                            <td className="py-3 text-red-600 font-medium">{product.stock} units</td>
                            <td className="py-3">{product.threshold} units</td>
                            <td className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Low Stock
                              </span>
                            </td>
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
                    <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                    Products Expiring Soon
                  </CardTitle>
                  <CardDescription>Products approaching expiry date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 text-left font-medium">Product Name</th>
                          <th className="py-3 text-left font-medium">Stock</th>
                          <th className="py-3 text-left font-medium">Expiry Date</th>
                          <th className="py-3 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiringProducts.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="py-3">{product.name}</td>
                            <td className="py-3">{product.stock} units</td>
                            <td className="py-3 text-yellow-600 font-medium">{product.expiryDate}</td>
                            <td className="py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Expiring Soon
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stock Level Trends</CardTitle>
                <CardDescription>Historical stock levels for critical products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                      datasets: [
                        {
                          label: 'MaxKill Insecticide',
                          data: [50, 45, 38, 32, 25, 20, 15, 12, 8, 5, 5, 5],
                          borderColor: 'rgba(239, 68, 68, 1)',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          tension: 0.4,
                        },
                        {
                          label: 'TermiteShield',
                          data: [35, 32, 28, 25, 20, 18, 12, 10, 6, 4, 2, 2],
                          borderColor: 'rgba(249, 115, 22, 1)',
                          backgroundColor: 'rgba(249, 115, 22, 0.1)',
                          tension: 0.4,
                        },
                        {
                          label: 'WeedBGone',
                          data: [40, 35, 30, 28, 22, 18, 15, 12, 10, 8, 6, 6],
                          borderColor: 'rgba(59, 130, 246, 1)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                        }
                      ]
                    }} 
                    options={{
                      ...lineChartOptions,
                      plugins: {
                        ...lineChartOptions.plugins,
                        annotation: {
                          annotations: {
                            line1: {
                              type: 'line',
                              yMin: 10,
                              yMax: 10,
                              borderColor: 'rgba(239, 68, 68, 0.5)',
                              borderWidth: 2,
                              borderDash: [6, 6],
                              label: {
                                display: true,
                                content: 'Threshold',
                                position: 'end'
                              }
                            }
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports; 