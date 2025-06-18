import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Loader } from '../../components/ui/loader';
import { StatCard } from '../../components/ui/stat-card';
import {
  ArrowLeft,
  Store,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  Eye
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { getStoreDashboardData, getStore } from '../../lib/api';
import { useToast } from '../../components/ui/use-toast';

const AdminStoreDashboard = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      
      // Fetch store details and dashboard data in parallel
      const [storeData, dashboardInfo] = await Promise.allSettled([
        getStore(storeId),
        getStoreDashboardData(storeId)
      ]);

      // Process store data
      if (storeData.status === 'fulfilled') {
        setStore(storeData.value);
      } else {
        console.error('Failed to fetch store data:', storeData.reason);
        toast({
          title: 'Warning',
          description: 'Could not fetch store details',
          variant: 'destructive',
        });
      }

      // Process dashboard data
      if (dashboardInfo.status === 'fulfilled') {
        setDashboardData(dashboardInfo.value);
      } else {
        console.error('Failed to fetch dashboard data:', dashboardInfo.reason);
        setError('Failed to load dashboard data');
      }

    } catch (error) {
      console.error('Error fetching store dashboard:', error);
      setError('Failed to load store dashboard');
      toast({
        title: 'Error',
        description: 'Failed to load store dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₨ 0';
    return `₨ ${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading store dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Dashboard</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/admin/store-management')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/store-management')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store Management
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {store?.name || 'Store Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                Admin view • {store?.email || 'No email'} • {formatDate(new Date())}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Eye className="mr-1 h-3 w-3" />
            Admin View
          </Badge>
        </div>

        {/* Store Information Card */}
        {store && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="mr-2 h-5 w-5" />
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">{store.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{store.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-lg">{store.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
                    {store.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Statistics */}
        {dashboardData?.stats?.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardData.stats.statistics.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                iconClass={stat.iconClass}
                change={stat.change}
                changeType={stat.changeType}
              />
            ))}
          </div>
        )}

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Recent Products ({dashboardData?.products?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.products?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.products.slice(0, 5).map((product) => (
                    <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stockQuantity || 0}</p>
                      </div>
                    </div>
                  ))}
                  {dashboardData.products.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      ...and {dashboardData.products.length - 5} more products
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No products found</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Customers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Recent Customers ({dashboardData?.customers?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.customers?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.customers.slice(0, 5).map((customer) => (
                    <div key={customer._id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{customer.phone || 'No phone'}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                  {dashboardData.customers.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      ...and {dashboardData.customers.length - 5} more customers
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No customers found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        {dashboardData?.orders?.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Recent Orders ({dashboardData.orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.orders.slice(0, 10).map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order._id?.slice(-8) || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {order.customer?.name || order.customerName || 'Unknown'}
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'completed' ? 'default' : 
                          order.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {order.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Inventory Overview */}
        {dashboardData?.inventory?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Inventory Overview ({dashboardData.inventory.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.inventory.slice(0, 10).map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.sku || 'N/A'}</TableCell>
                      <TableCell>{item.quantity || 0}</TableCell>
                      <TableCell>{item.unit || 'pcs'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === 'In Stock' ? 'default' : 
                          item.status === 'Low Stock' ? 'secondary' : 'destructive'
                        }>
                          {item.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminStoreDashboard; 