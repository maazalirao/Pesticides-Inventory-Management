import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { login, checkDatabaseHealth } from '../lib/api';

const Login = ({ setIsLoggedIn, setUserInfo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [dbStatus, setDbStatus] = useState(null);
  const navigate = useNavigate();

  // Check database health on component mount
  useEffect(() => {
    const checkDbHealth = async () => {
      try {
        const health = await checkDatabaseHealth();
        setDbStatus(health);
        console.log('Database status:', health);
      } catch (err) {
        console.error('Database health check failed:', err);
        setDbStatus({ status: 'error', message: err.toString() });
      }
    };
    
    checkDbHealth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const userData = await login(email, password);
      setIsLoggedIn(true);
      setUserInfo(userData);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle timeout errors specially
      if (error.toString().includes('unavailable') || 
          error.toString().includes('timed out') ||
          error.toString().includes('504')) {
        setError(
          'Connection to the server timed out. This might be due to slow internet or server issues.'
        );
      } else {
        setError(error.toString());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Retry connection to database
  const handleRetryConnection = async () => {
    setIsLoading(true);
    setError('');
    setRetryCount(prev => prev + 1);
    
    try {
      // First check database health
      const health = await checkDatabaseHealth();
      setDbStatus(health);
      
      if (health.status === 'success') {
        setError('Connection restored! Please try logging in again.');
      } else {
        setError('Still having connection issues. Please try again later.');
      }
    } catch (err) {
      setError('Could not connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-orange-700 mb-2">Pesticide Inventory</h1>
          <p className="text-muted-foreground">Inventory Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-medium mb-2">Error</p>
                <p className="text-sm">{error}</p>
                {error.toString().includes('timed out') || 
                 error.toString().includes('unavailable') || 
                 error.toString().includes('connection') ? (
                  <Button 
                    variant="outline" 
                    className="mt-2 text-xs bg-white hover:bg-red-50"
                    onClick={handleRetryConnection}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Checking connection...' : 'Retry Connection'}
                  </Button>
                ) : null}
              </div>
            )}
            
            {dbStatus && dbStatus.status === 'error' && !error && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
                <p className="font-medium mb-1">Database Connection Warning</p>
                <p className="text-sm mb-2">There may be connection issues with our database.</p>
                <Button 
                  variant="outline" 
                  className="text-xs bg-white hover:bg-yellow-50"
                  onClick={handleRetryConnection}
                  disabled={isLoading}
                >
                  Check Connection
                </Button>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center mt-2 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => navigate('/register')}
              >
                Sign up
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login; 