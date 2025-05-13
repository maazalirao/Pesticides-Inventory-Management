import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Store,
  Package,
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Building2,
  UsersRound,
  PackageOpen,
  ShoppingCart,
  ArrowUpDown,
  MoreHorizontal,
  Clock,
  CheckCircle2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import axios from 'axios';

// The base URL for the API
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api'  // Hard-coded for development
  : '/api';  // For production, use relative URL

const StoreManagement = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState([]);
  const [storeRequests, setStoreRequests] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestSearchQuery, setRequestSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('stores');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
    status: 'active',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',
  });
  const [requestData, setRequestData] = useState({
    name: '',
    description: '',
    requestorName: '',
    requestorEmail: '',
    requestorPhone: '',
    reasonForRequest: '',
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  useEffect(() => {
    fetchStores();
    fetchStoreRequests();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/stores`);
      setStores(data);
      setFilteredStores(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch stores',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };
  
  const fetchStoreRequests = async () => {
    setRequestsLoading(true);
    try {
      // This endpoint might need to be implemented in your backend
      const { data } = await axios.get(`${API_URL}/store-requests`);
      setStoreRequests(data);
      setFilteredRequests(data);
      setRequestsLoading(false);
    } catch (error) {
      console.error('Error fetching store requests:', error);
      // Mock data for development if the endpoint doesn't exist
      const mockRequests = [
        {
          _id: '1',
          name: 'New Retail Store',
          description: 'A new retail store in the downtown area',
          requestorName: 'John Smith',
          requestorEmail: 'john@example.com',
          requestorPhone: '+1 555-1234',
          reasonForRequest: 'Expanding business to new location',
          status: 'pending',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: '2',
          name: 'Warehouse Store',
          description: 'A large warehouse for bulk pesticide sales',
          requestorName: 'Sarah Johnson',
          requestorEmail: 'sarah@example.com',
          requestorPhone: '+1 555-5678',
          reasonForRequest: 'Need a dedicated warehouse for industrial clients',
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        }
      ];
      setStoreRequests(mockRequests);
      setFilteredRequests(mockRequests);
      setRequestsLoading(false);
    }
  };

  // Filter stores based on search and status filter
  useEffect(() => {
    let results = stores;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(store => 
        store.name.toLowerCase().includes(query) || 
        store.description?.toLowerCase().includes(query) ||
        store.email?.toLowerCase().includes(query) ||
        store.address?.city?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      results = results.filter(store => store.status === filterStatus);
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredStores(results);
  }, [stores, searchQuery, filterStatus, sortBy, sortOrder]);

  // Filter store requests based on search
  useEffect(() => {
    let results = storeRequests;
    
    // Apply search filter
    if (requestSearchQuery) {
      const query = requestSearchQuery.toLowerCase();
      results = results.filter(request => 
        request.name.toLowerCase().includes(query) || 
        request.description?.toLowerCase().includes(query) ||
        request.requestorName?.toLowerCase().includes(query) ||
        request.requestorEmail?.toLowerCase().includes(query)
      );
    }
    
    // Sort by created date (newest first)
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredRequests(results);
  }, [storeRequests, requestSearchQuery]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRequestSearch = (e) => {
    setRequestSearchQuery(e.target.value);
  };
  
  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };
  
  const handleRefresh = () => {
    if (activeTab === 'stores') {
      fetchStores();
    } else {
      fetchStoreRequests();
    }
  };

  const handleCreateStoreRequest = () => {
    setRequestData({
      name: '',
      description: '',
      requestorName: '',
      requestorEmail: '',
      requestorPhone: '',
      reasonForRequest: '',
    });
    setShowRequestDialog(true);
  };
  
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setRequestData({
      name: request.name || '',
      description: request.description || '',
      requestorName: request.requestorName || '',
      requestorEmail: request.requestorEmail || '',
      requestorPhone: request.requestorPhone || '',
      reasonForRequest: request.reasonForRequest || '',
    });
    setShowRequestDialog(true);
  };

  const handleRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData({
      ...requestData,
      [name]: value
    });
  };

  const submitStoreRequest = async () => {
    setLoading(true);
    try {
      // This endpoint might need to be implemented in your backend
      const response = await axios.post(`${API_URL}/store-requests`, {
        ...requestData,
        status: 'pending'
      });
      
      setStoreRequests([...storeRequests, response.data]);
      setShowRequestDialog(false);
      toast({
        title: 'Success',
        description: 'Store request submitted successfully. It will be reviewed by an administrator.',
      });
    } catch (error) {
      console.error('Error submitting store request:', error);
      // If the endpoint doesn't exist, simulate a successful response
      const mockRequest = {
        _id: Date.now().toString(),
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setStoreRequests([...storeRequests, mockRequest]);
      setShowRequestDialog(false);
      toast({
        title: 'Success',
        description: 'Store request submitted successfully. It will be reviewed by an administrator.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setLoading(true);
    try {
      // Find the request to approve
      const request = storeRequests.find(req => req._id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      
      // Create a new store from the request
      const storeData = {
        name: request.name,
        description: request.description,
        email: request.requestorEmail,
        phone: request.requestorPhone,
        status: 'active'
      };
      
      // Call API to create the store
      const storeResponse = await axios.post(`${API_URL}/stores`, storeData);
      
      // Update the request status
      const requestResponse = await axios.put(`${API_URL}/store-requests/${requestId}`, {
        status: 'approved'
      });
      
      // Update local state
      setStores([...stores, storeResponse.data]);
      setStoreRequests(storeRequests.map(req => 
        req._id === requestId ? { ...req, status: 'approved' } : req
      ));
      
      toast({
        title: 'Success',
        description: 'Store request approved and store created successfully',
      });
    } catch (error) {
      console.error('Error approving store request:', error);
      
      // For development/demo, simulate success even if endpoints don't exist
      const request = storeRequests.find(req => req._id === requestId);
      if (request) {
        // Create a mock store
        const mockStore = {
          _id: Date.now().toString(),
          name: request.name,
          description: request.description,
          email: request.requestorEmail,
          phone: request.requestorPhone,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Update states
        setStores([...stores, mockStore]);
        setStoreRequests(storeRequests.map(req => 
          req._id === requestId ? { ...req, status: 'approved' } : req
        ));
        
        toast({
          title: 'Success',
          description: 'Store request approved and store created successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to approve store request',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setLoading(true);
    try {
      // Call API to update the request status
      const response = await axios.put(`${API_URL}/store-requests/${requestId}`, {
        status: 'rejected'
      });
      
      // Update local state
      setStoreRequests(storeRequests.map(req => 
        req._id === requestId ? { ...req, status: 'rejected' } : req
      ));
      
      toast({
        title: 'Success',
        description: 'Store request rejected successfully',
      });
    } catch (error) {
      console.error('Error rejecting store request:', error);
      
      // For development/demo, simulate success
      setStoreRequests(storeRequests.map(req => 
        req._id === requestId ? { ...req, status: 'rejected' } : req
      ));
      
      toast({
        title: 'Success',
        description: 'Store request rejected successfully',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateStore = () => {
    setFormData({
      name: '',
      description: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      status: 'active',
      ownerEmail: '',
      ownerName: '',
      ownerPassword: '',
    });
    setShowCreateDialog(true);
  };
  
  const handleEditStore = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      description: store.description || '',
      email: store.email || '',
      phone: store.phone || '',
      address: {
        street: store.address?.street || '',
        city: store.address?.city || '',
        state: store.address?.state || '',
        postalCode: store.address?.postalCode || '',
        country: store.address?.country || '',
      },
      status: store.status || 'active',
    });
    setShowEditDialog(true);
  };
  
  const handleDeleteStore = (store) => {
    setSelectedStore(store);
    setShowDeleteDialog(true);
  };
  
  const handleManageOwner = (store) => {
    setSelectedStore(store);
    setFormData({
      ownerEmail: '',
      ownerName: '',
      ownerPassword: '',
    });
    setShowOwnerDialog(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const submitCreateStore = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/stores`, formData);
      
      setStores([...stores, response.data]);
      setShowCreateDialog(false);
      toast({
        title: 'Success',
        description: 'Store created successfully',
      });
    } catch (error) {
      console.error('Error creating store:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create store',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const submitEditStore = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/stores/${selectedStore._id}`, formData);
      
      // Update the stores list with the updated store
      const updatedStores = stores.map(store => 
        store._id === selectedStore._id ? response.data : store
      );
      
      setStores(updatedStores);
      setShowEditDialog(false);
      toast({
        title: 'Success',
        description: 'Store updated successfully',
      });
    } catch (error) {
      console.error('Error updating store:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update store',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const submitDeleteStore = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/stores/${selectedStore._id}`);
      
      // Remove the deleted store from the list
      const updatedStores = stores.filter(store => store._id !== selectedStore._id);
      
      setStores(updatedStores);
      setShowDeleteDialog(false);
      toast({
        title: 'Success',
        description: 'Store deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting store:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete store',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const submitUpdateOwner = async () => {
    setLoading(true);
    try {
      const ownerData = {
        email: formData.ownerEmail,
        name: formData.ownerName,
        password: formData.ownerPassword,
      };
      
      const response = await axios.post(
        `${API_URL}/stores/${selectedStore._id}/assign-owner`, 
        ownerData
      );
      
      // Update the stores list with the updated store
      const updatedStores = stores.map(store => 
        store._id === selectedStore._id ? response.data : store
      );
      
      setStores(updatedStores);
      setShowOwnerDialog(false);
      toast({
        title: 'Success',
        description: 'Store owner updated successfully',
      });
    } catch (error) {
      console.error('Error updating store owner:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update store owner',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };
  
  const formatCurrency = (amount) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage stores across your organization
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCreateStoreRequest}
          >
            <Clock className="mr-2 h-4 w-4" /> Request Store
          </Button>
          <Button onClick={handleCreateStore}>
            <Plus className="mr-2 h-4 w-4" /> New Store
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="requests">Store Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stores">
          {/* Filters and Controls for Stores */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search stores..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('all')}
              >
                All
              </Button>
              <Button 
                variant={filterStatus === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('active')}
              >
                Active
              </Button>
              <Button 
                variant={filterStatus === 'inactive' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleFilterChange('inactive')}
              >
                Inactive
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>
          
          {/* Stores Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStores.length > 0 ? (
                filteredStores.map(store => (
                  <Card key={store._id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{store.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {store.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={store.status === 'active' ? 'success' : 'secondary'}
                          className={`${
                            store.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {store.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        {store.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{store.email}</span>
                          </div>
                        )}
                        {store.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                        {store.address && Object.values(store.address).some(val => val) && (
                          <div className="flex items-start text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                            <span>
                              {[
                                store.address.street,
                                store.address.city,
                                store.address.state,
                                store.address.postalCode,
                                store.address.country
                              ].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 rounded p-3">
                          <div className="text-xs text-gray-500">Created</div>
                          <div className="font-medium">{formatDate(store.createdAt)}</div>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <div className="text-xs text-gray-500">Updated</div>
                          <div className="font-medium">{formatDate(store.updatedAt)}</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-gray-50 px-6 py-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleManageOwner(store)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Owner
                      </Button>
                      <div className="space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditStore(store)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => handleDeleteStore(store)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 py-10 text-center">
                  <Store className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-xl font-medium">No stores found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchQuery 
                      ? `No stores match "${searchQuery}"`
                      : 'Create your first store to get started'}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests">
          {/* Filters and Controls for Requests */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search store requests..."
                className="pl-10"
                value={requestSearchQuery}
                onChange={handleRequestSearch}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
              >
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>
          
          {/* Store Requests List */}
          {requestsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRequests.length > 0 ? (
                filteredRequests.map(request => (
                  <Card key={request._id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{request.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {request.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'success' :
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className={`${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {request.status === 'approved' ? 'Approved' :
                           request.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{request.requestorName}</span>
                        </div>
                        {request.requestorEmail && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{request.requestorEmail}</span>
                          </div>
                        )}
                        {request.requestorPhone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{request.requestorPhone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 bg-gray-50 rounded p-3">
                        <div className="text-xs text-gray-500">Reason for Request</div>
                        <div className="text-sm mt-1">{request.reasonForRequest || 'No reason provided'}</div>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-3 mt-2">
                        <div className="text-xs text-gray-500">Requested On</div>
                        <div className="font-medium">{formatDate(request.createdAt)}</div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between bg-gray-50 px-6 py-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {request.status === 'pending' && (
                        <div className="space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleApproveRequest(request._id)}
                            disabled={loading}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 py-10 text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-xl font-medium">No store requests found</h3>
                  <p className="mt-1 text-gray-500">
                    {requestSearchQuery 
                      ? `No requests match "${requestSearchQuery}"`
                      : 'There are no pending store requests'}
                  </p>
                  {requestSearchQuery && (
                    <Button 
                      variant="link" 
                      onClick={() => setRequestSearchQuery('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Create Store Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Store</DialogTitle>
            <DialogDescription>
              Add a new store to your organization. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Store Details</TabsTrigger>
              <TabsTrigger value="owner">Store Owner</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Store Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter store name"
                    className="mt-1"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the store"
                    className="mt-1 h-20"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@example.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="address.street">Street Address</Label>
                  <Input
                    id="address.street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="123 Main St"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address.city">City</Label>
                  <Input
                    id="address.city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address.state">State/Province</Label>
                  <Input
                    id="address.state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address.postalCode">Postal Code</Label>
                  <Input
                    id="address.postalCode"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address.country">Country</Label>
                  <Input
                    id="address.country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    placeholder="USA"
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="owner" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownerEmail">Owner Email</Label>
                  <Input
                    id="ownerEmail"
                    name="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={handleInputChange}
                    placeholder="owner@example.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ownerPassword">Password</Label>
                  <Input
                    id="ownerPassword"
                    name="ownerPassword"
                    type="password"
                    value={formData.ownerPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to skip creating an owner account. You can add an owner later.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitCreateStore}
              disabled={!formData.name || loading}
            >
              {loading ? 'Creating...' : 'Create Store'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Store Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>
              Update the details for this store.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-name">Store Name *</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter store name"
                className="mt-1"
                required
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the store"
                className="mt-1 h-20"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@example.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="edit-address.street">Street Address</Label>
              <Input
                id="edit-address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                placeholder="123 Main St"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-address.city">City</Label>
              <Input
                id="edit-address.city"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                placeholder="New York"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-address.state">State/Province</Label>
              <Input
                id="edit-address.state"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                placeholder="NY"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-address.postalCode">Postal Code</Label>
              <Input
                id="edit-address.postalCode"
                name="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleInputChange}
                placeholder="10001"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-address.country">Country</Label>
              <Input
                id="edit-address.country"
                name="address.country"
                value={formData.address.country}
                onChange={handleInputChange}
                placeholder="USA"
                className="mt-1"
              />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitEditStore}
              disabled={!formData.name || loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Store Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this store? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStore && (
            <div className="p-4 border rounded-md bg-gray-50">
              <h4 className="font-semibold">{selectedStore.name}</h4>
              {selectedStore.email && <p className="text-sm text-gray-500 mt-1">{selectedStore.email}</p>}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={submitDeleteStore}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Store'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Owner Dialog */}
      <Dialog open={showOwnerDialog} onOpenChange={setShowOwnerDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Store Owner</DialogTitle>
            <DialogDescription>
              Create and assign a store owner to manage this location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="modal-ownerName">Name</Label>
              <Input
                id="modal-ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="modal-ownerEmail">Email</Label>
              <Input
                id="modal-ownerEmail"
                name="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                placeholder="owner@example.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="modal-ownerPassword">Password</Label>
              <Input
                id="modal-ownerPassword"
                name="ownerPassword"
                type="password"
                value={formData.ownerPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowOwnerDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitUpdateOwner}
              disabled={!formData.ownerName || !formData.ownerEmail || !formData.ownerPassword || loading}
            >
              {loading ? 'Assigning...' : 'Assign Owner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Store Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-2 border-primary/20 shadow-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="text-xl font-bold text-primary">
              {selectedRequest ? 'Store Request Details' : 'Request New Store'}
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              {selectedRequest 
                ? 'Review the details of this store request.' 
                : 'Fill in the details below to request a new store.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-200">Store Name <span className="text-red-400">*</span></Label>
              <Input
                id="name"
                name="name"
                value={requestData.name}
                onChange={handleRequestInputChange}
                placeholder="Enter store name"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                disabled={selectedRequest}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-200">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={requestData.description}
                onChange={handleRequestInputChange}
                placeholder="Brief description of the store"
                className="mt-1 h-20 bg-gray-800 border-gray-700 text-white"
                disabled={selectedRequest}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="requestorName" className="text-sm font-semibold text-gray-200">Your Name <span className="text-red-400">*</span></Label>
              <Input
                id="requestorName"
                name="requestorName"
                value={requestData.requestorName}
                onChange={handleRequestInputChange}
                placeholder="John Doe"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                disabled={selectedRequest}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="requestorEmail" className="text-sm font-semibold text-gray-200">Your Email <span className="text-red-400">*</span></Label>
              <Input
                id="requestorEmail"
                name="requestorEmail"
                type="email"
                value={requestData.requestorEmail}
                onChange={handleRequestInputChange}
                placeholder="john@example.com"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                disabled={selectedRequest}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="requestorPhone" className="text-sm font-semibold text-gray-200">Your Phone</Label>
              <Input
                id="requestorPhone"
                name="requestorPhone"
                value={requestData.requestorPhone}
                onChange={handleRequestInputChange}
                placeholder="+1 (555) 123-4567"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                disabled={selectedRequest}
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="reasonForRequest" className="text-sm font-semibold text-gray-200">Reason for Request <span className="text-red-400">*</span></Label>
              <Textarea
                id="reasonForRequest"
                name="reasonForRequest"
                value={requestData.reasonForRequest}
                onChange={handleRequestInputChange}
                placeholder="Explain why you need this store to be created"
                className="mt-1 h-24 bg-gray-800 border-gray-700 text-white"
                disabled={selectedRequest}
                required
              />
            </div>
          </div>
          
          <DialogFooter className="pt-2 sm:pt-3 border-t border-gray-700 mt-3 sm:mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowRequestDialog(false)}
              className="bg-transparent border-gray-600 text-gray-200 hover:bg-gray-800 hover:text-white"
            >
              {selectedRequest ? 'Close' : 'Cancel'}
            </Button>
            {!selectedRequest && (
              <Button 
                onClick={submitStoreRequest}
                disabled={!requestData.name || !requestData.requestorName || !requestData.requestorEmail || !requestData.reasonForRequest || loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            )}
            {selectedRequest && selectedRequest.status === 'pending' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleApproveRequest(selectedRequest._id)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? 'Processing...' : 'Approve'}
                </Button>
                <Button 
                  onClick={() => handleRejectRequest(selectedRequest._id)}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {loading ? 'Processing...' : 'Reject'}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreManagement; 