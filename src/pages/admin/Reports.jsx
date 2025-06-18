import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  DollarSign,
  RefreshCw
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
import { useAuth } from '../../contexts/AuthContext';
import { 
  getSalesReport, 
  getInventoryReport, 
  getProductSalesReport, 
  getCustomerReport, 
  getExpiryReport,
  exportReport,
  clearCache
} from '../../lib/api';
import { useToast } from '../../components/ui/use-toast';

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
  const { selectedStore } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for report data
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: []
  });
  const [inventoryData, setInventoryData] = useState({
    labels: [],
    datasets: []
  });
  const [productSalesData, setProductSalesData] = useState({
    labels: [],
    datasets: []
  });
  const [customerData, setCustomerData] = useState({
    labels: [],
    datasets: []
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [selectedStore, reportType, dateRange]);
  
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data based on report type
      switch (reportType) {
        case 'sales':
          setSalesData({
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
              {
                label: 'Revenue (PKR)',
                data: [65000, 78000, 82000, 95000, 89000, 103000],
                borderColor: 'rgb(34, 197, 94)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
              }
            ]
          });
          break;
          
        case 'inventory':
          setInventoryData({
            labels: ['Pesticides', 'Fertilizers', 'Seeds', 'Tools', 'Herbicides'],
            datasets: [
              {
                data: [35, 25, 20, 12, 8],
                backgroundColor: [
                  '#22c55e',
                  '#3b82f6',
                  '#f59e0b',
                  '#8b5cf6',
                  '#ef4444'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            ]
          });
          break;
          
        case 'products':
          setProductSalesData({
            labels: ['Neem Oil', 'NPK Fertilizer', 'Wheat Seeds', 'Glyphosate', 'Garden Sprayer'],
            datasets: [
              {
                label: 'Units Sold',
                data: [156, 134, 98, 87, 45],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
              }
            ]
          });
          break;
          
        case 'customers':
          setCustomerData({
            labels: ['New Customers', 'Returning Customers', 'Inactive'],
            datasets: [
              {
                data: [45, 67, 23],
                backgroundColor: [
                  '#22c55e',
                  '#3b82f6',
                  '#f59e0b'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            ]
          });
          break;
          
        case 'expiry':
          setLowStockProducts([
            { id: 1, name: 'Neem Oil Organic Pesticide', currentStock: 5, minStock: 20 },
            { id: 2, name: 'NPK Fertilizer 20-20-20', currentStock: 8, minStock: 15 },
            { id: 3, name: 'Wheat Seeds Premium', currentStock: 12, minStock: 25 }
          ]);
          setExpiringProducts([
            { id: 1, name: 'Glyphosate Herbicide', expiryDate: '2024-02-15', daysLeft: 30 },
            { id: 2, name: 'Organic Fungicide', expiryDate: '2024-02-20', daysLeft: 35 },
            { id: 3, name: 'Plant Growth Regulator', expiryDate: '2024-02-25', daysLeft: 40 }
          ]);
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setError("Failed to load report data. Please try again later.");
      if (toast) {
        toast({
          title: "Error",
          description: "Failed to load report data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    console.log("Refreshing report data...");
    
    // Clear the cache for reports
    clearCache('reports');
    
    // Fetch fresh data
    fetchReportData();
  };
  
  const handleExport = async () => {
    try {
      setLoading(true);
      
      const response = await exportReport(reportType, dateRange);
      
      // Create blob from response
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report-${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "Success",
        description: "Report exported successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `Rs ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `Rs ${(amount / 1000).toFixed(0)}K`;
    } else {
      return `Rs ${amount.toFixed(0)}`;
    }
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

  // KPI summary data - Enhanced with more financial metrics
  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(125000),
      change: "+12.5%",
      changeType: "positive",
      icon: <DollarSign className="h-5 w-5" />,
      iconClass: "bg-green-100 text-green-600",
      description: "All stores combined"
    },
    {
      title: "Net Profit",
      value: formatCurrency(31000),
      change: "+8.3%",
      changeType: "positive",
      icon: <TrendingUp className="h-5 w-5" />,
      iconClass: "bg-blue-100 text-blue-600",
      description: "24.8% profit margin"
    },
    {
      title: "Active Orders",
      value: "145",
      change: "+23",
      changeType: "positive",
      icon: <Package className="h-5 w-5" />,
      iconClass: "bg-purple-100 text-purple-600",
      description: "Processing & pending"
    },
    {
      title: "Low Stock Items",
      value: "18",
      change: "+5",
      changeType: "negative",
      icon: <AlertTriangle className="h-5 w-5" />,
      iconClass: "bg-yellow-100 text-yellow-600",
      description: "Requires attention"
    },
    {
      title: "Total Customers",
      value: "2,340",
      change: "+156",
      changeType: "positive",
      icon: <DollarSign className="h-5 w-5" />,
      iconClass: "bg-indigo-100 text-indigo-600",
      description: "Active customer base"
    },
    {
      title: "Avg Order Value",
      value: formatCurrency(862),
      change: "+5.2%",
      changeType: "positive",
      icon: <TrendingUp className="h-5 w-5" />,
      iconClass: "bg-teal-100 text-teal-600",
      description: "Per transaction"
    }
  ];

  const getCurrentReportContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 py-24">
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

    switch (reportType) {
      case 'sales':
        return (
          <div className="h-72 md:h-96">
            <Line data={salesData} options={lineChartOptions} />
          </div>
        );
      case 'inventory':
        return (
          <div className="h-72 md:h-96">
            <Doughnut data={inventoryData} options={pieChartOptions} />
          </div>
        );
      case 'products':
        return (
          <div className="h-72 md:h-96">
            <Bar data={productSalesData} options={barChartOptions} />
          </div>
        );
      case 'customers':
        return (
          <div className="h-72 md:h-96">
            <Pie data={customerData} options={pieChartOptions} />
          </div>
        );
      case 'expiry':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Low Stock Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Low Stock Items</CardTitle>
                  <CardDescription>Products that need restocking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">Current: {product.currentStock} | Min: {product.minStock}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Low Stock
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Expiring Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expiring Products</CardTitle>
                  <CardDescription>Products nearing expiry date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expiringProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">Expires: {product.expiryDate}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                            {product.daysLeft} days left
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Select a report type to view data</p>
          </div>
        );
    }
  };

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
          <Button variant="outline" className="flex items-center gap-2" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi, index) => (
          <Card key={index} className="h-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-full ${kpi.iconClass}`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <h2 className="text-lg font-bold truncate">{kpi.value}</h2>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
                <div className={`flex items-center text-xs ${
                  kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.changeType === 'positive' ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  <span>{kpi.change}</span>
                </div>
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
            reportType === 'expiry'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
          onClick={() => setReportType('expiry')}
        >
          Stock Alerts
        </button>
      </div>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === 'sales' && 'Sales Performance'}
            {reportType === 'inventory' && 'Inventory Distribution'}
            {reportType === 'products' && 'Product Sales'}
            {reportType === 'customers' && 'Customer Analysis'}
            {reportType === 'expiry' && 'Stock Alerts'}
          </CardTitle>
          <CardDescription>
            {reportType === 'sales' && 'Monthly sales and revenue trends'}
            {reportType === 'inventory' && 'Stock distribution by category'}
            {reportType === 'products' && 'Product sales performance'}
            {reportType === 'customers' && 'Customer segmentation analysis'}
            {reportType === 'expiry' && 'Low stock and expiring products'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {getCurrentReportContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports; 