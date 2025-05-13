import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Building2, 
  ShoppingBag, 
  Shield, 
  BarChart2,
  Database,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Package
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const RoleSelection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="py-6 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 flex items-center justify-center shadow-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                Pesticide Inventory
              </span>
              <div className="text-xs text-slate-400 mt-0.5">Management System</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Title Section */}
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1 bg-orange-500/20 text-orange-300 rounded-full mb-4 font-medium text-sm border border-orange-500/30">
                Welcome to Pesticide Inventory System
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Role</span>
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Select whether you want to access the system as an Administrator or Store Owner. Your choice determines the features and tools available to you.
              </p>
            </div>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Admin Role Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-600/20 rounded-2xl transform -translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-orange-500/30 shadow-lg group-hover:border-orange-500/50 transition-all duration-300"></div>
                
                <div className="relative p-8 z-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-500/30 rounded-full blur-xl group-hover:bg-orange-500/40 group-hover:scale-110 transition-all duration-300"></div>
                      <div className="relative h-20 w-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                        <Settings className="h-10 w-10 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-center mb-4 text-white">Administrator</h2>
                  <p className="text-slate-300 text-center mb-8">
                    Manage the entire system, including stores, inventory, users, and settings.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3 text-slate-200">
                      <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <span>Manage multiple stores</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-200">
                      <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <span>Review and approve store requests</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-200">
                      <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <span>Access global system settings</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-200">
                      <CheckCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <span>View system-wide analytics</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <Button 
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg py-6 shadow-lg hover:shadow-orange-500/30 flex items-center justify-center group-hover:scale-105 transition-transform"
                      onClick={() => navigate('/admin')}
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Enter as Administrator
                      <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Store Owner Role Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl transform -translate-y-1 translate-x-1 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl border border-emerald-500/30 shadow-lg group-hover:border-emerald-500/50 transition-all duration-300"></div>
                
                <div className="relative p-8 z-10">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl group-hover:bg-emerald-500/40 group-hover:scale-110 transition-all duration-300"></div>
                      <div className="relative h-20 w-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                        <Building2 className="h-10 w-10 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-center mb-4 text-white">Store Owner</h2>
                  <p className="text-slate-300 text-center mb-8">
                    Manage your store, handle inventory, process orders, and view analytics.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center space-x-3 text-slate-200">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span>Manage store inventory</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-200">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span>Process customer orders</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-200">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span>View store analytics</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-200">
                      <Clock className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span>Request new stores</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <Button 
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg py-6 shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform"
                      onClick={() => navigate('/select-store')}
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Enter as Store Owner
                      <ArrowRight className="ml-2 h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-16 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 rounded-lg p-3">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Need another role?</h3>
                  <p className="text-slate-300">
                    If you need access to additional roles or have questions about your account permissions, please contact the system administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Pesticide Inventory Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection; 