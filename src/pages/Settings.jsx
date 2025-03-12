import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { User, Bell, Shield, HardDrive, Palette, Globe, Mail, Key, ChevronRight, Save, AlertTriangle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/ThemeProvider';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account');
  const { theme, toggleTheme } = useTheme();
  
  // Mock user data
  const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    company: 'PestTrack Solutions',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff',
    twoFactorEnabled: true,
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      stockAlerts: true,
      orderUpdates: true,
      marketingEmails: false
    },
    appearance: {
      theme: theme,
      compactMode: false,
      animationsEnabled: true,
      fontSize: 'medium'
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      lastBackup: '2023-12-15T08:30:00'
    }
  };
  
  // State for form values
  const [formValues, setFormValues] = useState(userData);
  
  // Update form values when theme changes
  useEffect(() => {
    setFormValues(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: theme
      }
    }));
  }, [theme]);
  
  // Handle form changes
  const handleChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Toggle between light and dark mode
  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <div className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                     onClick={() => setActiveTab('account')}>
                  <User className={`h-5 w-5 mr-2 ${activeTab === 'account' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={activeTab === 'account' ? 'font-medium' : 'text-muted-foreground'}>Account</span>
                  {activeTab === 'account' && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                </div>
                
                <div className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                     onClick={() => setActiveTab('notifications')}>
                  <Bell className={`h-5 w-5 mr-2 ${activeTab === 'notifications' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={activeTab === 'notifications' ? 'font-medium' : 'text-muted-foreground'}>Notifications</span>
                  {activeTab === 'notifications' && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                </div>
                
                <div className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                     onClick={() => setActiveTab('security')}>
                  <Shield className={`h-5 w-5 mr-2 ${activeTab === 'security' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={activeTab === 'security' ? 'font-medium' : 'text-muted-foreground'}>Security</span>
                  {activeTab === 'security' && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                </div>
                
                <div className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                     onClick={() => setActiveTab('appearance')}>
                  <Palette className={`h-5 w-5 mr-2 ${activeTab === 'appearance' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={activeTab === 'appearance' ? 'font-medium' : 'text-muted-foreground'}>Appearance</span>
                  {activeTab === 'appearance' && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                </div>
                
                <div className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                     onClick={() => setActiveTab('language')}>
                  <Globe className={`h-5 w-5 mr-2 ${activeTab === 'language' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={activeTab === 'language' ? 'font-medium' : 'text-muted-foreground'}>Language & Region</span>
                  {activeTab === 'language' && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                </div>
                
                <div className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                     onClick={() => setActiveTab('backup')}>
                  <HardDrive className={`h-5 w-5 mr-2 ${activeTab === 'backup' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={activeTab === 'backup' ? 'font-medium' : 'text-muted-foreground'}>Backup & Restore</span>
                  {activeTab === 'backup' && <ChevronRight className="h-4 w-4 ml-auto text-primary" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={userData.avatar} 
                    alt="Profile" 
                    className="h-16 w-16 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{userData.name}</h3>
                    <p className="text-sm text-muted-foreground">{userData.role}</p>
                    <p className="text-sm text-muted-foreground">{userData.company}</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Change Avatar
                  </Button>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={userData.name}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={userData.email}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Company</label>
                    <input 
                      type="text" 
                      defaultValue={userData.company}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Role</label>
                    <select 
                      defaultValue={userData.role}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option>Administrator</option>
                      <option>Manager</option>
                      <option>Employee</option>
                      <option>Read Only</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Channels</h3>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <label htmlFor="email-notifications" className="text-sm">Email Notifications</label>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={formValues.notifications.email}
                      onCheckedChange={(checked) => handleChange('notifications', 'email', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <label htmlFor="browser-notifications" className="text-sm">Browser Notifications</label>
                    </div>
                    <Switch 
                      id="browser-notifications" 
                      checked={formValues.notifications.browser}
                      onCheckedChange={(checked) => handleChange('notifications', 'browser', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <label htmlFor="mobile-notifications" className="text-sm">Mobile Push Notifications</label>
                    </div>
                    <Switch 
                      id="mobile-notifications" 
                      checked={formValues.notifications.mobile}
                      onCheckedChange={(checked) => handleChange('notifications', 'mobile', checked)}
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label htmlFor="stock-alerts" className="text-sm">Low Stock Alerts</label>
                      <p className="text-xs text-muted-foreground">Receive alerts when inventory items are running low</p>
                    </div>
                    <Switch 
                      id="stock-alerts" 
                      checked={formValues.notifications.stockAlerts}
                      onCheckedChange={(checked) => handleChange('notifications', 'stockAlerts', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label htmlFor="order-updates" className="text-sm">Order Updates</label>
                      <p className="text-xs text-muted-foreground">Get notified about new orders and status changes</p>
                    </div>
                    <Switch 
                      id="order-updates" 
                      checked={formValues.notifications.orderUpdates}
                      onCheckedChange={(checked) => handleChange('notifications', 'orderUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label htmlFor="marketing-emails" className="text-sm">Marketing Emails</label>
                      <p className="text-xs text-muted-foreground">Receive newsletters, promotions and updates</p>
                    </div>
                    <Switch 
                      id="marketing-emails" 
                      checked={formValues.notifications.marketingEmails}
                      onCheckedChange={(checked) => handleChange('notifications', 'marketingEmails', checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your password and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Password Update</h3>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter your current password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">New Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter a new password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm">Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Confirm your new password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" 
                    />
                  </div>
                  
                  <Button className="mt-2">Update Password</Button>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm">Two-factor authentication</p>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account by requiring more than just a password to sign in.
                      </p>
                    </div>
                    <Switch 
                      id="two-factor" 
                      checked={formValues.twoFactorEnabled}
                      onCheckedChange={(checked) => setFormValues({...formValues, twoFactorEnabled: checked})}
                    />
                  </div>
                  
                  {formValues.twoFactorEnabled && (
                    <div className="p-4 rounded-md bg-muted">
                      <p className="text-sm">
                        Two-factor authentication is enabled. You will need to enter a code from your authenticator app when signing in.
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Key className="h-4 w-4 mr-2" />
                        Reconfigure
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-medium">Session Management</h3>
                  
                  <div className="p-4 rounded-md border border-muted">
                    <h4 className="text-sm font-medium">Current Session</h4>
                    <div className="flex justify-between items-center mt-2">
                      <div>
                        <p className="text-sm">Windows 10 • Chrome</p>
                        <p className="text-xs text-muted-foreground">
                          Last active: Today at 10:24 AM
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Current
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="destructive" size="sm">Sign Out All Other Sessions</Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize how the application looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Theme</h3>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      {theme === 'dark' 
                        ? <Moon className="h-5 w-5 text-muted-foreground" /> 
                        : <Sun className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <p className="text-sm">Dark Mode</p>
                        <p className="text-xs text-muted-foreground">
                          Switch between light and dark themes
                        </p>
                      </div>
                    </div>
                    <Switch 
                      id="theme-toggle" 
                      checked={theme === 'dark'}
                      onCheckedChange={handleThemeToggle}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div 
                      className={`p-4 border rounded-md cursor-pointer hover:border-primary transition-colors ${theme === 'light' ? 'border-primary bg-muted/50' : ''}`}
                      onClick={() => toggleTheme('light')}
                    >
                      <div className="h-20 bg-background border rounded-md mb-2"></div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </div>
                    
                    <div 
                      className={`p-4 border rounded-md cursor-pointer hover:border-primary transition-colors ${theme === 'dark' ? 'border-primary bg-muted/50' : ''}`}
                      onClick={() => toggleTheme('dark')}
                    >
                      <div className="h-20 bg-zinc-800 border rounded-md mb-2"></div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-medium">Display Options</h3>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm">Compact Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Display more information on screen with a more compact layout
                      </p>
                    </div>
                    <Switch 
                      id="compact-mode" 
                      checked={formValues.appearance.compactMode}
                      onCheckedChange={(checked) => handleChange('appearance', 'compactMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm">Enable Animations</p>
                      <p className="text-xs text-muted-foreground">
                        Show animations for transitions and UI elements
                      </p>
                    </div>
                    <Switch 
                      id="animations" 
                      checked={formValues.appearance.animationsEnabled}
                      onCheckedChange={(checked) => handleChange('appearance', 'animationsEnabled', checked)}
                    />
                  </div>
                  
                  <div className="grid gap-2 pt-2">
                    <label className="text-sm">Font Size</label>
                    <select 
                      value={formValues.appearance.fontSize}
                      onChange={(e) => handleChange('appearance', 'fontSize', e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'language' && (
            <Card>
              <CardHeader>
                <CardTitle>Language & Regional Settings</CardTitle>
                <CardDescription>Configure language and regional preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Language</label>
                    <select 
                      defaultValue="en-US"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="en-US">English (United States)</option>
                      <option value="en-GB">English (United Kingdom)</option>
                      <option value="fr-FR">Français (France)</option>
                      <option value="de-DE">Deutsch (Deutschland)</option>
                      <option value="es-ES">Español (España)</option>
                      <option value="zh-CN">中文 (简体)</option>
                      <option value="ja-JP">日本語 (日本)</option>
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Time Zone</label>
                    <select 
                      defaultValue="America/New_York"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="America/New_York">Eastern Time (US & Canada)</option>
                      <option value="America/Chicago">Central Time (US & Canada)</option>
                      <option value="America/Denver">Mountain Time (US & Canada)</option>
                      <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Date Format</label>
                    <select 
                      defaultValue="MM/DD/YYYY"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Currency</label>
                    <select 
                      defaultValue="USD"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-4 rounded-md bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-200">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Information</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Changing your language or regional settings will apply to all aspects of your PestTrack experience, including notifications, reports, and invoices.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          )}
          
          {activeTab === 'backup' && (
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Manage data backup and restoration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-md bg-muted">
                  <h3 className="text-sm font-medium">Backup Status</h3>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Auto-backup:</span>
                      <span className="text-sm font-medium">{formValues.backup.autoBackup ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Frequency:</span>
                      <span className="text-sm font-medium capitalize">{formValues.backup.backupFrequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last backup:</span>
                      <span className="text-sm font-medium">{formatDate(formValues.backup.lastBackup)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next scheduled backup:</span>
                      <span className="text-sm font-medium">December 16, 2023, 08:30 AM</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">Automatic Backups</p>
                      <p className="text-xs text-muted-foreground">
                        Automatically backup your data on a regular schedule
                      </p>
                    </div>
                    <Switch 
                      id="auto-backup" 
                      checked={formValues.backup.autoBackup}
                      onCheckedChange={(checked) => handleChange('backup', 'autoBackup', checked)}
                    />
                  </div>
                  
                  {formValues.backup.autoBackup && (
                    <div className="grid gap-2 pl-8">
                      <label className="text-sm">Backup Frequency</label>
                      <select 
                        value={formValues.backup.backupFrequency}
                        onChange={(e) => handleChange('backup', 'backupFrequency', e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button className="w-full" onClick={() => alert('Manual backup initiated')}>
                    <Save className="h-4 w-4 mr-2" />
                    Backup Now
                  </Button>
                  <Button variant="outline" className="w-full">
                    Restore from Backup
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-3">Export Data</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Export your data in different formats for external use or backup
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm">Export as CSV</Button>
                    <Button variant="outline" size="sm">Export as Excel</Button>
                    <Button variant="outline" size="sm">Export as PDF</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 