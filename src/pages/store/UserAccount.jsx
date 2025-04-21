import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight, 
  MapPin, 
  Mail, 
  Phone,
  Edit,
  Eye
} from 'lucide-react';

const UserAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Mock user data
  const user = {
    name: 'Maaz Ali',
    email: 'maaz@gmail.com',
    phone: '+92 300 1234567',
    address: {
      street: '123 Model Town',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan'
    },
    createdAt: '2023-01-15'
  };
  
  // Order history - initially empty
  const orders = [];
  
  // Mock wishlist
  const wishlist = [
    { id: 1, name: 'MaxKill Insecticide', price: 49.99, image: 'https://placehold.co/100x100/22c55e/FFFFFF/png?text=MaxKill' },
    { id: 2, name: 'HerbControl Plus', price: 38.50, image: 'https://placehold.co/100x100/3b82f6/FFFFFF/png?text=HerbControl' },
    { id: 3, name: 'FungoClear Solution', price: 65.00, image: 'https://placehold.co/100x100/8b5cf6/FFFFFF/png?text=FungoClear' }
  ];
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Get order status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm text-gray-600 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight size={16} className="mx-2" />
        <span className="font-medium text-gray-800">My Account</span>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary/10 rounded-full p-3">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center ${
                  activeTab === 'profile' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center ${
                  activeTab === 'orders' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="h-4 w-4 mr-3" />
                Orders
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center ${
                  activeTab === 'wishlist' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Heart className="h-4 w-4 mr-3" />
                Wishlist
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left py-2 px-3 rounded-md flex items-center ${
                  activeTab === 'settings' 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </button>
              <Link
                to="/logout"
                className="w-full text-left py-2 px-3 rounded-md flex items-center text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Contact our customer support team if you have any questions.
            </p>
            <Link 
              to="/contact" 
              className="text-primary text-sm hover:underline"
            >
              Contact Support
            </Link>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="md:w-3/4">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Profile Information</h2>
                <button className="text-primary hover:text-primary/80 flex items-center text-sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Profile
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-medium">{user.phone}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4">Default Shipping Address</h3>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p>{user.address.street}</p>
                        <p>{user.address.city}, {user.address.state} {user.address.zipCode}</p>
                        <p>{user.address.country}</p>
                        <button className="text-primary text-sm hover:underline mt-2 flex items-center">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Address
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-bold">Order History</h2>
              </div>
              
              <div className="p-6">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No orders yet</h3>
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Link 
                      to="/shop" 
                      className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                          <div>
                            <span className="text-sm text-gray-500">Order #:</span>
                            <span className="font-semibold ml-2">{order.id}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Date:</span>
                            <span className="font-medium ml-2">{formatDate(order.date)}</span>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Total:</span>
                            <span className="font-medium ml-2">{formatCurrency(order.total)}</span>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold mb-3">Order Items</h3>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between py-2 border-b last:border-0">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="px-4 py-3 bg-gray-50 flex justify-end">
                          <Link 
                            to={`/orders/${order.id}`}
                            className="text-primary flex items-center hover:underline"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Order Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-bold">My Wishlist</h2>
              </div>
              
              <div className="p-6">
                {wishlist.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-4">Save items you're interested in for later.</p>
                    <Link 
                      to="/shop" 
                      className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden">
                        <div className="p-4 flex">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="ml-4">
                            <Link to={`/product/${item.id}`} className="font-medium hover:text-primary">
                              {item.name}
                            </Link>
                            <p className="text-primary font-semibold mt-1">{formatCurrency(item.price)}</p>
                            <div className="mt-2 flex gap-2">
                              <button className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90">
                                Add to Cart
                              </button>
                              <button className="text-xs text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-50">
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-bold">Account Settings</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Password</h3>
                    <button className="text-primary hover:underline flex items-center text-sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Change Password
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Communication Preferences</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Email notifications for orders</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Email notifications for promotions</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>SMS notifications</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Account Management</h3>
                    <button className="text-red-600 hover:underline text-sm">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAccount; 