import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getDashboardStats,
  getSalesData,
  getInventoryDistribution,
  getCustomerSegments,
  getSalesForecast,
  getLowStockProducts,
  getExpiringProducts,
  getRecentSales,
} from "../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [inventoryDistribution, setInventoryDistribution] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]);
  const [salesForecast, setSalesForecast] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          statsData,
          salesData,
          inventoryData,
          customerData,
          forecastData,
          lowStockData,
          expiringData,
          recentData,
        ] = await Promise.all([
          getDashboardStats(user.clerkId),
          getSalesData(user.clerkId),
          getInventoryDistribution(user.clerkId),
          getCustomerSegments(user.clerkId),
          getSalesForecast(user.clerkId),
          getLowStockProducts(user.clerkId),
          getExpiringProducts(user.clerkId),
          getRecentSales(user.clerkId),
        ]);

        setStats(statsData);
        setSalesData(salesData);
        setInventoryDistribution(inventoryData);
        setCustomerSegments(customerData);
        setSalesForecast(forecastData);
        setLowStockProducts(lowStockData);
        setExpiringProducts(expiringData);
        setRecentSales(recentData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.clerkId) {
      fetchDashboardData();
    }
  }, [user?.clerkId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats?.totalSales.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats?.totalInventoryValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalCustomers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.lowStockItems}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {inventoryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegments}
                    dataKey="count"
                    nameKey="segment"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {customerSegments.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock and Expiring Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center"
                >
                  <span>{product.name}</span>
                  <span className="text-red-500">
                    {product.quantity} {product.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expiring Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center"
                >
                  <span>{product.name}</span>
                  <span className="text-red-500">
                    {new Date(product.expiry_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{sale.customer_name}</span>
                  <span className="text-gray-500 ml-2">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-medium">
                  ${sale.total_amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
