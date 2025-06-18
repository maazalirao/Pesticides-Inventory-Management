import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Building2, 
  User, 
  Lock, 
  Loader, 
  AlertCircle, 
  ArrowLeft,
  Store
} from 'lucide-react';

const StoreOwnerLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAdminAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/select-store');
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
        
        // Only allow store owners
        if (userData.role !== 'store_owner') {
          setLoginError('This login is for Store Owners only. Please use the Admin login for administrators.');
          return;
        }
        
        // Redirect based on store count
        if (userData.stores?.length > 1) {
          navigate('/select-store');
        } else {
          navigate('/storeowner/dashboard');
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Role Selection */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/role-selection')}
            className="text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role Selection
          </Button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Store Owner Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your store management dashboard
          </p>
        </div>

        {/* Development Credentials Card */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-emerald-700">Store Owner Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-emerald-600 space-y-2">
                <div className="space-y-1">
                  <p><strong>Maaz Store:</strong> maaz@pest.com / maaz123</p>
                  <p><strong>Jamal Store:</strong> jamal@pest.com / jamal123</p>
                  <p><strong>Mudasir Store:</strong> mudasir@pest.com / mudasir123</p>
                  <p><strong>Sample Store:</strong> sample@pest.com / sample123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="w-5 h-5 mr-2 text-emerald-600" />
              Store Owner Access
            </CardTitle>
            <CardDescription>
              Enter your store owner credentials to manage your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Login Error */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700">{loginError}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="store.owner@example.com"
                    className={`pl-10 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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
                    className={`pl-10 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 mr-2" />
                    Access Store Dashboard
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Store owner authentication with secure access control
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreOwnerLogin; 