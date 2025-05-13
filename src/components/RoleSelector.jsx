import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

const RoleSelector = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    // Navigate to the appropriate dashboard based on role
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'store_owner') {
      navigate('/select-store');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background via-background to-background/90">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Select Your Role</h1>
        <p className="mt-2 text-muted-foreground">Choose which dashboard you want to access</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group">
          <CardHeader className="pb-4 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center mr-3">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl text-white">Admin</CardTitle>
            </div>
            <CardDescription className="text-slate-300">
              Full system access with ability to manage all stores and owners.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-5 w-5 text-orange-500 flex-shrink-0">✓</div>
                <div>
                  <p className="font-medium">Manage Multiple Stores</p>
                  <p className="text-sm text-muted-foreground">Create, edit, and delete stores in the system.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-5 w-5 text-orange-500 flex-shrink-0">✓</div>
                <div>
                  <p className="font-medium">Assign Store Owners</p>
                  <p className="text-sm text-muted-foreground">Create and manage store owner accounts.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-5 w-5 text-orange-500 flex-shrink-0">✓</div>
                <div>
                  <p className="font-medium">Global Dashboard</p>
                  <p className="text-sm text-muted-foreground">Access analytics and data across all stores.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-5 w-5 text-orange-500 flex-shrink-0">✓</div>
                <div>
                  <p className="font-medium">System Settings</p>
                  <p className="text-sm text-muted-foreground">Configure global system parameters and permissions.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-slate-50 dark:bg-slate-900/40 p-4">
            <Button 
              className="w-full bg-orange-600 hover:bg-orange-700 group-hover:shadow-md transition-all"
              onClick={() => handleSelectRole('admin')}
            >
              Continue as Admin <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group">
          <CardHeader className="pb-4 bg-gradient-to-r from-emerald-900 to-emerald-800">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center mr-3">
                <Store className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl text-white">Store Owner</CardTitle>
            </div>
            <CardDescription className="text-emerald-100">
              Manage your assigned store's inventory, orders, and customers.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-5 w-5 text-emerald-500 flex-shrink-0">✓</div>
                <div>
                  <p className="font-medium">Store Dashboard</p>
                  <p className="text-sm text-muted-foreground">Access metrics and data for your assigned store.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-5 w-5 text-emerald-500 flex-shrink-0">✓</div>
                <div>
                  <p className="font-medium">Inventory Management</p>
                  <p className="text-sm text-muted-foreground">Manage products, stock levels, and categories.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-5 w-5 text-emerald-500 flex-shrink-0">✓</div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-muted-foreground">View, track, and manage customer orders.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mt-1 mr-3 h-5 w-5 text-emerald-500 flex-shrink-0">✓</div>
                <div>
                  <p className="font-medium">Store Settings</p>
                  <p className="text-sm text-muted-foreground">Configure your store details and preferences.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-emerald-50 dark:bg-emerald-900/40 p-4">
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 group-hover:shadow-md transition-all"
              onClick={() => handleSelectRole('store_owner')}
            >
              Continue as Store Owner <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelector; 