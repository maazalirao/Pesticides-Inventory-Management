import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  ShoppingCart,
  Search,
  RefreshCw,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Calendar,
  Users,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Eye,
  AlertTriangle,
  Store,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrders, clearCache } from '../../lib/api';
import { useToast } from '../../components/ui/use-toast';

const StoreOwnerOrders = () => {
  const { selectedStore } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedStore) {
      console.log("No store selected, skipping orders fetch");
      return;
    }
    
    fetchOrders();
  }, [selectedStore]);

    const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching orders for store:", selectedStore?._id);
      
      if (!selectedStore || !selectedStore._id) {
        console.warn("No store selected or invalid store ID");
        setOrders([]);
        setFilteredOrders([]);
        setError("Please select a store to view orders");
        setLoading(false);
        return;
      }
      
      // Get store-specific orders from localStorage using the selected store ID
      const storeOrdersKey = `store_orders_${selectedStore._id}`;
      const savedOrders = JSON.parse(localStorage.getItem(storeOrdersKey) || '[]');
      
      console.log(`Fetching orders for store: ${selectedStore.name} (${selectedStore._id})`);
      
      // If we have saved orders for this store, use them
      if (savedOrders && savedOrders.length > 0) {
        console.log("Found orders in localStorage:", savedOrders.length);
        
        // Ensure each order has the store information
        const ordersWithStore = savedOrders.map(order => ({
          ...order,
          store: {
            id: selectedStore._id,
            name: selectedStore.name
          }
        }));
        
        setOrders(ordersWithStore);
        setFilteredOrders(ordersWithStore);
        
        // Dispatch event to notify other components about orders update
        window.dispatchEvent(new Event('ordersUpdated'));
      } else {
        // Otherwise fall back to the API - in a real app, you'd filter by store ID on the server
        try {
          // In a real API call, you'd include the store ID as a parameter
          // const data = await getOrders(selectedStore._id);
          const data = await getOrders();
          
          // Filter orders to only include those from the selected store
          const storeOrders = (data || []).filter(order => {
            // Check if any product in the order belongs to the selected store
            return order.items && order.items.some(item => 
              item.storeId === selectedStore._id
            );
          });
          
          console.log("Orders filtered for this store:", storeOrders.length);
          
          // Add store information to each order
          const ordersWithStore = storeOrders.map(order => ({
            ...order,
            store: {
              id: selectedStore._id,
              name: selectedStore.name
            }
          }));
          
          setOrders(ordersWithStore);
          setFilteredOrders(ordersWithStore);
          
          // Dispatch event to notify other components about orders update
          window.dispatchEvent(new Event('ordersUpdated'));
        } catch (apiError) {
          console.error("API error:", apiError);
          // If API fails, just use empty array
          setOrders([]);
          setFilteredOrders([]);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
    };

  // Filter and sort orders
  useEffect(() => {
    let results = [...orders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(order => 
        order.id.toLowerCase().includes(query) || 
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query) ||
        order.items.some(item => item.name.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(order => order.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let filterDate = new Date(today);
      
      if (dateFilter === 'today') {
        filterDate = today;
      } else if (dateFilter === 'yesterday') {
        filterDate.setDate(today.getDate() - 1);
      } else if (dateFilter === 'thisWeek') {
        filterDate.setDate(today.getDate() - 7);
      } else if (dateFilter === 'thisMonth') {
        filterDate.setMonth(today.getMonth() - 1);
      }
      
      results = results.filter(order => new Date(order.date) >= filterDate);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'customer':
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredOrders(results);
  }, [searchQuery, statusFilter, dateFilter, sortBy, sortOrder, orders]);

  // Handle refresh button click
  const handleRefresh = () => {
    console.log("Refreshing orders data...");
    
    // Clear orders cache
    clearCache('orders');
    
    // Fetch fresh data
    fetchOrders();
    
    // Notify other components about possible orders update
    window.dispatchEvent(new Event('ordersUpdated'));
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-blue-500 border-blue-500">Processing</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="text-purple-500 border-purple-500">Shipped</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="text-emerald-500 border-emerald-500">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const calculateTotalItems = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
        <p className="text-muted-foreground">Loading orders data...</p>
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
    <div className="flex flex-col h-full space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold">Orders</h2>
        <p className="text-muted-foreground">Manage customer orders for your store.</p>
      </div>
      
      {/* Filters and actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search orders..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <div className="dropdown-container relative">
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <Filter className="h-4 w-4" />
                Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="dropdown-menu absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border z-10 hidden">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStatusFilter('all')}
                  >
                    All Statuses
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStatusFilter('processing')}
                  >
                    Processing
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStatusFilter('shipped')}
                  >
                    Shipped
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStatusFilter('delivered')}
                  >
                    Delivered
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setStatusFilter('cancelled')}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
            </div>
            
            <div className="dropdown-container relative">
              <Button variant="outline" className="flex items-center gap-2 w-full">
                <Calendar className="h-4 w-4" />
                Date: {dateFilter === 'all' ? 'All Time' : 
                       dateFilter === 'today' ? 'Today' : 
                       dateFilter === 'yesterday' ? 'Yesterday' :
                       dateFilter === 'thisWeek' ? 'This Week' :
                       'This Month'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div className="dropdown-menu absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border z-10 hidden">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDateFilter('all')}
                  >
                    All Time
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDateFilter('today')}
                  >
                    Today
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDateFilter('yesterday')}
                  >
                    Yesterday
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDateFilter('thisWeek')}
                  >
                    This Week
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDateFilter('thisMonth')}
                  >
                    This Month
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {/* Sorting options */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => {
            if (sortBy === 'id') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('id');
              setSortOrder('desc');
            }
          }}
        >
          Order ID
          {sortBy === 'id' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => {
            if (sortBy === 'date') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('date');
              setSortOrder('desc');
            }
          }}
        >
          Date
          {sortBy === 'date' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => {
            if (sortBy === 'customer') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('customer');
              setSortOrder('asc');
            }
          }}
        >
          Customer
          {sortBy === 'customer' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8"
          onClick={() => {
            if (sortBy === 'total') {
              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            } else {
              setSortBy('total');
              setSortOrder('desc');
            }
          }}
        >
          Total
          {sortBy === 'total' && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </Button>
      </div>
      
      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          Array(5).fill(0).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="h-6 w-24 bg-muted rounded-md"></div>
                  <div className="h-6 w-28 bg-muted rounded-md"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-5 w-40 bg-muted rounded-md"></div>
                    <div className="h-4 w-32 bg-muted rounded-md"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 w-20 bg-muted rounded-md"></div>
                    <div className="h-4 w-16 bg-muted rounded-md"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Orders Found</h3>
              <p className="text-muted-foreground mt-2 text-center max-w-md">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all' ? 
                  "No orders match your current filters. Try adjusting your search criteria." : 
                  "You haven't received any orders yet."}
              </p>
              {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          // Order cards
          filteredOrders.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <CardTitle className="text-lg mr-3">{order.id}</CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <CardDescription className="text-sm">
                    Ordered on {formatDate(order.date)}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-wrap justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{order.customer.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs h-5">{order.customer.type || 'Customer'}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer.email} • {order.customer.phone}
                    </div>
                    <div className="text-sm flex items-baseline space-x-3">
                      <span className="font-medium">{order.items.length} product types</span>
                      <span className="text-muted-foreground">{calculateTotalItems(order.items)} total items</span>
                    </div>
                    {/* Display store info if present */}
                    {order.store && (
                      <div className="text-sm flex items-center mt-2">
                        <Store className="h-4 w-4 mr-2 text-emerald-500" />
                        <span className="text-emerald-600 font-medium">{order.store.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end mt-4 sm:mt-0">
                    <div className="text-xl font-bold mb-1">
                      {formatCurrency(order.total)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Payment: {order.paymentStatus === 'paid' ? 
                        <span className="text-emerald-600">Paid</span> : 
                        order.paymentStatus === 'refunded' ? 
                        <span className="text-amber-600">Refunded</span> : 
                        <span className="text-red-600">Pending</span>}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="h-8">
                        <Eye className="h-3.5 w-3.5 mr-1" /> Details
                      </Button>
                      {order.status === 'pending' && (
                        <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700">
                          Process
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700">
                          <Truck className="h-3.5 w-3.5 mr-1" /> Ship
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="mt-4 flex items-start p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-amber-800 dark:text-amber-300 text-sm">Customer Notes:</div>
                      <div className="text-sm text-amber-700 dark:text-amber-400">{order.notes}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StoreOwnerOrders; 