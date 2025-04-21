import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, Eye, TruckIcon } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real application, this would be an API call
    // For now, we'll use mock data
    setTimeout(() => {
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'ORD-2023-001',
          createdAt: '2023-05-15T10:30:00Z',
          user: { name: 'John Farmer' },
          totalPrice: 249.95,
          isPaid: true,
          paidAt: '2023-05-15T10:35:00Z',
          isDelivered: true,
          deliveredAt: '2023-05-18T14:20:00Z',
          status: 'Delivered',
          shippingAddress: {
            address: '123 Farm Road',
            city: 'Farmville',
            postalCode: '12345',
            country: 'USA'
          },
          paymentMethod: 'Credit Card',
          orderItems: [
            {
              name: 'MaxKill Insecticide',
              quantity: 3,
              price: 49.99,
              image: 'https://placehold.co/100x100/22c55e/FFFFFF/png?text=MaxKill'
            },
            {
              name: 'HerbControl Plus',
              quantity: 2,
              price: 38.50,
              image: 'https://placehold.co/100x100/3b82f6/FFFFFF/png?text=HerbControl'
            }
          ]
        },
        {
          _id: '2',
          orderNumber: 'ORD-2023-002',
          createdAt: '2023-05-20T15:45:00Z',
          user: { name: 'Sarah Gardener' },
          totalPrice: 95.49,
          isPaid: true,
          paidAt: '2023-05-20T15:50:00Z',
          isDelivered: false,
          deliveredAt: null,
          status: 'Processing',
          shippingAddress: {
            address: '456 Garden Lane',
            city: 'Greenfield',
            postalCode: '54321',
            country: 'USA'
          },
          paymentMethod: 'PayPal',
          orderItems: [
            {
              name: 'MosquitoKiller',
              quantity: 2,
              price: 32.75,
              image: 'https://placehold.co/100x100/22c55e/FFFFFF/png?text=MosquitoKiller'
            },
            {
              name: 'RatAway Pellets',
              quantity: 1,
              price: 29.99,
              image: 'https://placehold.co/100x100/f97316/FFFFFF/png?text=RatAway'
            }
          ]
        },
        {
          _id: '3',
          orderNumber: 'ORD-2023-003',
          createdAt: '2023-06-05T09:15:00Z',
          user: { name: 'Michael Orchard' },
          totalPrice: 345.00,
          isPaid: true,
          paidAt: '2023-06-05T09:20:00Z',
          isDelivered: true,
          deliveredAt: '2023-06-08T13:40:00Z',
          status: 'Delivered',
          shippingAddress: {
            address: '789 Orchard Blvd',
            city: 'Fruitville',
            postalCode: '67890',
            country: 'USA'
          },
          paymentMethod: 'Credit Card',
          orderItems: [
            {
              name: 'FungoClear Solution',
              quantity: 4,
              price: 65.00,
              image: 'https://placehold.co/100x100/8b5cf6/FFFFFF/png?text=FungoClear'
            },
            {
              name: 'AntiPest Powder',
              quantity: 2,
              price: 42.50,
              image: 'https://placehold.co/100x100/22c55e/FFFFFF/png?text=AntiPest'
            }
          ]
        },
        {
          _id: '4',
          orderNumber: 'ORD-2023-004',
          createdAt: '2023-06-10T14:00:00Z',
          user: { name: 'Emily Homestead' },
          totalPrice: 27.99,
          isPaid: false,
          paidAt: null,
          isDelivered: false,
          deliveredAt: null,
          status: 'Pending',
          shippingAddress: {
            address: '101 Homestead Ave',
            city: 'Hometown',
            postalCode: '13579',
            country: 'USA'
          },
          paymentMethod: 'Credit Card',
          orderItems: [
            {
              name: 'WeedBGone',
              quantity: 1,
              price: 27.99,
              image: 'https://placehold.co/100x100/3b82f6/FFFFFF/png?text=WeedBGone'
            }
          ]
        },
        {
          _id: '5',
          orderNumber: 'ORD-2023-005',
          createdAt: '2023-06-15T11:30:00Z',
          user: { name: 'College Agricultural Dept' },
          totalPrice: 314.97,
          isPaid: true,
          paidAt: '2023-06-15T11:35:00Z',
          isDelivered: false,
          deliveredAt: null,
          status: 'Shipped',
          shippingAddress: {
            address: '200 College Campus',
            city: 'Eduville',
            postalCode: '24680',
            country: 'USA'
          },
          paymentMethod: 'Bank Transfer',
          orderItems: [
            {
              name: 'MaxKill Insecticide',
              quantity: 3,
              price: 49.99,
              image: 'https://placehold.co/100x100/22c55e/FFFFFF/png?text=MaxKill'
            },
            {
              name: 'FungoClear Solution',
              quantity: 2,
              price: 65.00,
              image: 'https://placehold.co/100x100/8b5cf6/FFFFFF/png?text=FungoClear'
            }
          ]
        }
      ];
      
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'All' || order.status === filter;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <Button>
          <TruckIcon className="mr-2 h-4 w-4" />
          Ship Orders
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:items-center mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <select
            className="p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-600">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search or filter</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order._id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-gray-50 pb-2">
                  <CardTitle className="text-lg">
                    {order.orderNumber}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusBadge(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Customer</h4>
                      <p>{order.user.name}</p>
                      <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
                      <p className="text-sm text-gray-500">
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Order Details</h4>
                      <p className="text-sm">{order.orderItems.length} {order.orderItems.length === 1 ? 'item' : 'items'}</p>
                      <p className="text-sm">{formatCurrency(order.totalPrice)}</p>
                      <p className="text-sm text-gray-500">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Payment</h4>
                      <p className={`text-sm ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {order.isPaid ? `Paid on ${formatDate(order.paidAt)}` : 'Not Paid'}
                      </p>
                    </div>
                    <div className="flex items-end justify-end">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye size={16} />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Orders; 