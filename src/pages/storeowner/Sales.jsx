import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Calendar,
  Download, 
  Eye,
  RefreshCw,
  Filter,
  Search,
  Package,
  Users,
  CreditCard,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart2,
  PieChart,
  LineChart,
  Star,
  Award,
  Target,
  Zap
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
import { useAdminAuth } from '../../contexts/AdminAuthContext';
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

const Sales = () => {
  const { selectedStore } = useAdminAuth();
  const { toast } = useToast();
  
  // State management
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sales data state
  const [salesStats, setSalesStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    totalProducts: 0,
    topSellingProduct: null
  });
  
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: []
  });
  
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: []
  });
  
  const [paymentMethodData, setPaymentMethodData] = useState({
    labels: [],
    datasets: []
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerMetrics, setCustomerMetrics] = useState([]);
  
  // Fetch sales data
  useEffect(() => {
    fetchSalesData();
  }, [selectedStore, timeRange]);
  
  const fetchSalesData = async () => {
    try {
      setLoading(true);
      
      // Mock data - Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sales statistics
      setSalesStats({
        totalRevenue: 125000,
        totalOrders: 245,
        averageOrderValue: 510.20,
        conversionRate: 3.2,
        totalProducts: 89,
        topSellingProduct: "Neem Oil Organic Pesticide"
      });
      
      // Sales chart data
      setSalesData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Revenue (PKR)',
            data: [12000, 19000, 15000, 25000, 22000, 30000, 20000],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
          },
          {
            label: 'Orders',
            data: [25, 35, 30, 45, 40, 55, 38],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            yAxisID: 'y1',
          }
        ]
      });
      
      // Category performance data
      setCategoryData({
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
      
      // Payment method data
      setPaymentMethodData({
        labels: ['Cash on Delivery', 'Bank Transfer', 'Credit Card', 'Mobile Wallet'],
        datasets: [
          {
            data: [45, 30, 15, 10],
            backgroundColor: [
              '#10b981',
              '#3b82f6',
              '#f59e0b',
              '#8b5cf6'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
          }
        ]
      });
      
      // Recent transactions
      setRecentTransactions([
        {
          id: 'TXN-001',
          customer: 'Ahmed Ali Khan',
          amount: 2500,
          products: 3,
          date: new Date(),
          status: 'completed',
          paymentMethod: 'Cash on Delivery'
        },
        {
          id: 'TXN-002',
          customer: 'Fatima Hussain',
          amount: 1850,
          products: 2,
          date: new Date(Date.now() - 3600000),
          status: 'pending',
          paymentMethod: 'Bank Transfer'
        },
        {
          id: 'TXN-003',
          customer: 'Mohammad Anwar',
          amount: 3200,
          products: 5,
          date: new Date(Date.now() - 7200000),
          status: 'completed',
          paymentMethod: 'Credit Card'
        },
        {
          id: 'TXN-004',
          customer: 'Sarah Ahmad',
          amount: 950,
          products: 1,
          date: new Date(Date.now() - 10800000),
          status: 'completed',
          paymentMethod: 'Mobile Wallet'
        },
        {
          id: 'TXN-005',
          customer: 'Hassan Malik',
          amount: 4100,
          products: 7,
          date: new Date(Date.now() - 14400000),
          status: 'processing',
          paymentMethod: 'Cash on Delivery'
        }
      ]);
      
      // Top selling products
      setTopProducts([
        {
          id: 1,
          name: 'Neem Oil Organic Pesticide',
          sales: 156,
          revenue: 23400,
          growth: 12.5,
          image: '/api/placeholder/60/60'
        },
        {
          id: 2,
          name: 'NPK Fertilizer 20-20-20',
          sales: 134,
          revenue: 20100,
          growth: 8.3,
          image: '/api/placeholder/60/60'
        },
        {
          id: 3,
          name: 'Wheat Seeds Premium',
          sales: 98,
          revenue: 14700,
          growth: -2.1,
          image: '/api/placeholder/60/60'
        },
        {
          id: 4,
          name: 'Glyphosate Herbicide',
          sales: 87,
          revenue: 13050,
          growth: 15.7,
          image: '/api/placeholder/60/60'
        },
        {
          id: 5,
          name: 'Garden Sprayer Pro',
          sales: 45,
          revenue: 6750,
          growth: 5.2,
          image: '/api/placeholder/60/60'
        }
      ]);
      
      // Customer metrics
      setCustomerMetrics([
        { label: 'New Customers', value: 23, change: 15.3, positive: true },
        { label: 'Returning Customers', value: 67, change: 8.7, positive: true },
        { label: 'Customer Satisfaction', value: 94, change: 2.1, positive: true, isPercentage: true },
        { label: 'Average Order Frequency', value: 2.3, change: -0.2, positive: false, suffix: '/month' }
      ]);
      
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-PK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Chart options
  const salesChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Days'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (PKR)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Orders'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      }
    }
  };
  
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sales data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-1">Track and analyze your store's sales performance</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <Button onClick={fetchSalesData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesStats.totalRevenue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last period
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{salesStats.totalOrders}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% from last period
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(salesStats.averageOrderValue)}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +4.1% from last period
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{salesStats.conversionRate}%</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -0.3% from last period
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="h-5 w-5 mr-2" />
              Sales Trend
            </CardTitle>
            <CardDescription>Revenue and order trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={salesData} options={salesChartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Category Performance
            </CardTitle>
            <CardDescription>Sales distribution by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={categoryData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Customer Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </CardTitle>
            <CardDescription>Customer payment preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Pie data={paymentMethodData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Customer Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Customer Metrics
            </CardTitle>
            <CardDescription>Key customer performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}{metric.isPercentage ? '%' : ''}{metric.suffix || ''}
                    </p>
                  </div>
                  <div className={`flex items-center text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.positive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Top Selling Products
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardTitle>
            <CardDescription>Best performing products this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sales} sales • {formatCurrency(product.revenue)}</p>
                  </div>
                  <div className={`flex items-center text-sm ${product.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.growth >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {Math.abs(product.growth)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Transactions
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardTitle>
            <CardDescription>Latest customer transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{transaction.customer}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.products} products • {formatDate(transaction.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
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
};

export default Sales; 