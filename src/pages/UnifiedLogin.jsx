import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  Building2, 
  User, 
  Lock, 
  Loader, 
  AlertCircle, 
  Shield,
  Store,
  Plus,
  Package,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../components/ui/use-toast';

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'store_owner' // Default to store owner
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Store registration state
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [requestData, setRequestData] = useState({
    name: '',
    description: '',
    requestorName: '',
    requestorEmail: '',
    requestorPhone: '',
    reasonForRequest: '',
    preferredEmail: '',
    preferredPassword: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'store_owner') {
        if (user.stores?.length > 1) {
          navigate('/select-store');
        } else {
          navigate('/storeowner/dashboard');
        }
      }
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear login error
    if (loginError) {
      setLoginError('');
    }
  };

  // Handle store request input changes
  const handleRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData({
      ...requestData,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoginError('');
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        const userData = result.userData;
        
        // Validate role matches selection
        if (userData.role !== formData.role) {
          setLoginError(`This account is registered as ${userData.role === 'admin' ? 'Administrator' : 'Store Owner'}. Please select the correct role.`);
          return;
        }
        
        // Redirect based on role and store count
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'store_owner') {
          if (userData.stores?.length > 1) {
            navigate('/select-store');
          } else {
            navigate('/storeowner/dashboard');
          }
        }
      } else {
        setLoginError(result.message || 'Login failed');
      }
    } catch (error) {
      setLoginError('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle store registration request
  const handleSubmitStoreRequest = async () => {
    // Validate form - make credentials mandatory
    if (!requestData.name || !requestData.requestorName || !requestData.requestorEmail || !requestData.reasonForRequest || !requestData.preferredEmail || !requestData.preferredPassword) {
      toast({
        title: 'Missing information',
        description: 'All fields including login credentials are required for store access',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.requestorEmail)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid contact email address',
        variant: 'destructive',
      });
      return;
    }

    if (!emailRegex.test(requestData.preferredEmail)) {
      toast({
        title: 'Invalid login email',
        description: 'Please enter a valid login email address',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmittingRequest(true);
    
    try {
      // Try to submit to API
      try {
        const { createStoreRequest } = await import('../lib/api');
        const response = await createStoreRequest(requestData);
        
        setShowRegistrationDialog(false);
        toast({
          title: 'Request submitted successfully!',
          description: 'Your store request has been submitted and will be reviewed by an administrator.',
        });
        
        // Reset form
        setRequestData({
          name: '',
          description: '',
          requestorName: '',
          requestorEmail: '',
          requestorPhone: '',
          reasonForRequest: '',
          preferredEmail: '',
          preferredPassword: '',
        });
        
      } catch (error) {
        console.log('API submission failed, using localStorage fallback');
        
        // Fallback to localStorage
        const storeRequest = {
          ...requestData,
          _id: Date.now().toString(),
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        let existingRequests = [];
        try {
          const storedRequests = localStorage.getItem('storeRequests');
          if (storedRequests) {
            existingRequests = JSON.parse(storedRequests);
          }
        } catch (e) {
          console.error('Error parsing stored requests:', e);
        }
        
        existingRequests.push(storeRequest);
        localStorage.setItem('storeRequests', JSON.stringify(existingRequests));
        
        setShowRegistrationDialog(false);
        toast({
          title: 'Request submitted successfully!',
          description: 'Your store request has been saved locally and will be processed when the server is available.',
        });
        
        // Reset form
        setRequestData({
          name: '',
          description: '',
          requestorName: '',
          requestorEmail: '',
          requestorPhone: '',
          reasonForRequest: '',
          preferredEmail: '',
          preferredPassword: '',
        });
      }
      
    } catch (error) {
      console.error('Error submitting store request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit store request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader className="w-8 h-8 text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-full blur-xl opacity-50"></div>
            <Package className="h-10 w-10 text-white relative z-10" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-300">
            Access your pesticide inventory system
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-center text-gray-300">
              Choose your role and enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-gray-200 font-medium">Login as:</Label>
                <Tabs value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger value="admin" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      Administrator
                    </TabsTrigger>
                    <TabsTrigger value="store_owner" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                      <Building2 className="w-4 h-4 mr-2" />
                      Store Owner
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Development Credentials */}
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <TabsContent value="admin" className="mt-4">
                        <Card className="bg-blue-900/30 border-blue-600/30">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-blue-300">Administrator Credentials</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs text-blue-200">
                              <p><strong>Email:</strong> admin@example.com</p>
                              <p><strong>Password:</strong> admin123</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="store_owner" className="mt-4">
                        <Card className="bg-emerald-900/30 border-emerald-600/30">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-emerald-300">Store Owner Credentials</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-xs text-emerald-200 space-y-1">
                              <p><strong>Maaz Store:</strong> maaz@pest.com / maaz123</p>
                              <p><strong>Jamal Store:</strong> jamal@pest.com / jamal123</p>
                              <p><strong>Mudasir Store:</strong> mudasir@pest.com / mudasir123</p>
                              <p><strong>Sample Store:</strong> sample@pest.com / sample123</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </>
                  )}
                </Tabs>
              </div>

              {/* Login Error */}
              {loginError && (
                <div className="bg-red-900/30 border border-red-600/30 rounded-md p-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-300">{loginError}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className={`pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className={`pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 ${errors.password ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full py-3 font-semibold transition-all duration-200 ${
                  formData.role === 'admin' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    {formData.role === 'admin' ? (
                      <Shield className="w-4 h-4 mr-2" />
                    ) : (
                      <Building2 className="w-4 h-4 mr-2" />
                    )}
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Store Registration */}
        <Card className="bg-gray-800/30 backdrop-blur-xl border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Need a new store?</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Request access to create a new store. Your request will be reviewed by an administrator.
                </p>
                <Button
                  onClick={() => setShowRegistrationDialog(true)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Request New Store
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            Secure access with role-based authentication
          </p>
        </div>
      </div>

      {/* Store Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center text-emerald-400">
              <Plus className="h-6 w-6 mr-2" />
              Request New Store
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Fill in the details below to request a new store. Your request will be reviewed by an administrator.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-200">Store Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={requestData.name}
                  onChange={handleRequestInputChange}
                  placeholder="Enter store name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requestorName" className="text-gray-200">Your Name *</Label>
                <Input
                  id="requestorName"
                  name="requestorName"
                  value={requestData.requestorName}
                  onChange={handleRequestInputChange}
                  placeholder="Your full name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requestorEmail" className="text-gray-200">Your Email *</Label>
                <Input
                  id="requestorEmail"
                  name="requestorEmail"
                  type="email"
                  value={requestData.requestorEmail}
                  onChange={handleRequestInputChange}
                  placeholder="your.email@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requestorPhone" className="text-gray-200">Phone Number</Label>
                <Input
                  id="requestorPhone"
                  name="requestorPhone"
                  value={requestData.requestorPhone}
                  onChange={handleRequestInputChange}
                  placeholder="Your contact number"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-gray-200">Store Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={requestData.description}
                  onChange={handleRequestInputChange}
                  placeholder="Brief description of the store"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="reasonForRequest" className="text-gray-200">Reason for Request *</Label>
                <Textarea
                  id="reasonForRequest"
                  name="reasonForRequest"
                  value={requestData.reasonForRequest}
                  onChange={handleRequestInputChange}
                  placeholder="Why do you need this store to be created?"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              {/* Login Credentials Section */}
              <div className="md:col-span-2 border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-lg font-semibold text-emerald-400 mb-2">Login Credentials (Required) *</h4>
                <p className="text-sm text-gray-400 mb-4">
                  These credentials will be used to login to your store dashboard after approval.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredEmail" className="text-gray-200">Store Login Email *</Label>
                    <Input
                      id="preferredEmail"
                      name="preferredEmail"
                      type="email"
                      value={requestData.preferredEmail}
                      onChange={handleRequestInputChange}
                      placeholder="yourstore@pest.com"
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      This will be your login email for the store dashboard
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preferredPassword" className="text-gray-200">Store Login Password *</Label>
                    <Input
                      id="preferredPassword"
                      name="preferredPassword"
                      type="password"
                      value={requestData.preferredPassword}
                      onChange={handleRequestInputChange}
                      placeholder="Enter secure password"
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      You will use this password to access your store
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRegistrationDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitStoreRequest}
              disabled={!requestData.name || !requestData.requestorName || !requestData.requestorEmail || !requestData.reasonForRequest || !requestData.preferredEmail || !requestData.preferredPassword || isSubmittingRequest}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmittingRequest ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Store Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnifiedLogin; 