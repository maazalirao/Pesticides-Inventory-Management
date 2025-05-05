import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import {
  User,
  Bell,
  Shield,
  HardDrive,
  Palette,
  Globe,
  Mail,
  Key,
  ChevronRight,
  Save,
  AlertTriangle,
  Sun,
  Moon,
  UserCircle,
  LoaderCircle,
} from "lucide-react";
import { useTheme } from "../../lib/ThemeProvider";
import { getUserProfile } from "../../lib/api";
import { useUser } from "@clerk/clerk-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const { theme } = useTheme();
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Default static user data as fallback
  const defaultUserData = {
    name:
      clerkUser?.firstName && clerkUser?.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser?.username || "User",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "user@example.com",
    role: "Administrator",
    company: "PestTrack Solutions",
    avatar:
      clerkUser?.imageUrl ||
      `https://ui-avatars.com/api/?name=${
        clerkUser?.firstName || "User"
      }&background=6366f1&color=fff`,
    twoFactorEnabled: false,
    notifications: {
      email: true,
      browser: true,
      mobile: false,
      stockAlerts: true,
      orderUpdates: true,
      marketingEmails: false,
      marketingEmails: false,
    },
    appearance: {
      theme: theme,
      compactMode: false,
      animationsEnabled: true,
      fontSize: "medium",
      fontSize: "medium",
    },
    backup: {
      autoBackup: true,
      backupFrequency: "daily",
      lastBackup: new Date().toISOString(),
    },
  };

  // State for user data
  const [userData, setUserData] = useState(defaultUserData);

  // State for form values
  const [formValues, setFormValues] = useState(userData);

  // Fetch user data from the database
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        if (clerkUser) {
          const data = await getUserProfile();

          if (isMounted) {
            console.log("User profile data:", data);

            // If we have data from the database, use it
            if (data) {
              // Merge with default data for any missing fields
              const mergedData = {
                ...defaultUserData,
                name:
                  data.firstName && data.lastName
                    ? `${data.firstName} ${data.lastName}`
                    : data.name || defaultUserData.name,
                email: data.email || defaultUserData.email,
                role: data.role || defaultUserData.role,
                // Keep other default fields if not provided by the API
              };

              setUserData(mergedData);
              setFormValues(mergedData);
            }

            setError("");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching user data:", err);
          // setError("Failed to fetch user data. Using default settings.");
          // Use default data on error
          setUserData(defaultUserData);
          setFormValues(defaultUserData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [clerkUser]);

  // Update form values when theme changes
  useEffect(() => {
    setFormValues((prev) => ({
    setFormValues((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: "light",
      },
        theme: "light",
      },
    }));
  }, []);


  // Handle form changes
  const handleChange = (section, field, value) => {
    setFormValues((prev) => ({
    setFormValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
        [field]: value,
      },
    }));
  };


  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    // Here you would implement the API call to save the changes
    // For now just show an alert
    alert("Changes saved successfully!");
  };

  // Handle manual backup
  const handleBackupNow = () => {
    // Update last backup time to now
    const now = new Date().toISOString();
    setFormValues((prev) => ({
      ...prev,
      backup: {
        ...prev.backup,
        lastBackup: now,
      },
    }));

    alert("Manual backup initiated");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="hidden md:block text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <h1 className="hidden md:block text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="hidden md:block text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-1">
                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("account")}
                >
                  <User
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "account"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "account"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Account
                  </span>
                  {activeTab === "account" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}
                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("account")}
                >
                  <User
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "account"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "account"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Account
                  </span>
                  {activeTab === "account" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}
                </div>

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "notifications"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "notifications"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Notifications
                  </span>
                  {activeTab === "notifications" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("notifications")}
                >
                  <Bell
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "notifications"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "notifications"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Notifications
                  </span>
                  {activeTab === "notifications" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}
                </div>

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("security")}
                >
                  <Shield
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "security"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "security"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Security
                  </span>
                  {activeTab === "security" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("security")}
                >
                  <Shield
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "security"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "security"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Security
                  </span>
                  {activeTab === "security" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}
                </div>

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("appearance")}
                >
                  <Palette
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "appearance"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "appearance"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Appearance
                  </span>
                  {activeTab === "appearance" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("appearance")}
                >
                  <Palette
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "appearance"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "appearance"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Appearance
                  </span>
                  {activeTab === "appearance" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}
                </div>

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("language")}
                >
                  <Globe
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "language"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "language"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Language & Region
                  </span>
                  {activeTab === "language" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("language")}
                >
                  <Globe
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "language"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "language"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Language & Region
                  </span>
                  {activeTab === "language" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}
                </div>

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("backup")}
                >
                  <HardDrive
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "backup"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "backup"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Backup & Restore
                  </span>
                  {activeTab === "backup" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}

                <div
                  className="flex items-center p-2 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setActiveTab("backup")}
                >
                  <HardDrive
                    className={`h-5 w-5 mr-2 ${
                      activeTab === "backup"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={
                      activeTab === "backup"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    Backup & Restore
                  </span>
                  {activeTab === "backup" && (
                    <ChevronRight className="h-4 w-4 ml-auto text-primary" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "account" && (
          {activeTab === "account" && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  {formValues.avatar ? (
                    <img
                      src={formValues.avatar}
                      alt="Profile"
                      className="h-16 w-16 rounded-full"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="h-10 w-10 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{formValues.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formValues.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formValues.company}
                    </p>
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
                      value={formValues.name}
                      onChange={(e) =>
                        setFormValues({ ...formValues, name: e.target.value })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>


                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <input
                      type="email"
                      value={formValues.email}
                      onChange={(e) =>
                        setFormValues({ ...formValues, email: e.target.value })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>


                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Company</label>
                    <input
                      type="text"
                      value={formValues.company}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          company: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>


                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Role</label>
                    <select
                      value={formValues.role}
                      onChange={(e) =>
                        setFormValues({ ...formValues, role: e.target.value })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                      <option value="Read Only">Read Only</option>
                    </select>
                  </div>
                </div>
              </CardContent>
              {/* <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setFormValues(userData)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter> */}
            </Card>
          )}

          {activeTab === "notifications" && (

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Channels</h3>


                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <label htmlFor="email-notifications" className="text-sm">
                        Email Notifications
                      </label>
                      <label htmlFor="email-notifications" className="text-sm">
                        Email Notifications
                      </label>
                    </div>
                    <Switch
                      id="email-notifications"
                    <Switch
                      id="email-notifications"
                      checked={formValues.notifications.email}
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "email", checked)
                      }
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "email", checked)
                      }
                    />
                  </div>


                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <label
                        htmlFor="browser-notifications"
                        className="text-sm"
                      >
                        Browser Notifications
                      </label>
                      <label
                        htmlFor="browser-notifications"
                        className="text-sm"
                      >
                        Browser Notifications
                      </label>
                    </div>
                    <Switch
                      id="browser-notifications"
                    <Switch
                      id="browser-notifications"
                      checked={formValues.notifications.browser}
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "browser", checked)
                      }
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "browser", checked)
                      }
                    />
                  </div>


                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <label htmlFor="mobile-notifications" className="text-sm">
                        Mobile Push Notifications
                      </label>
                      <label htmlFor="mobile-notifications" className="text-sm">
                        Mobile Push Notifications
                      </label>
                    </div>
                    <Switch
                      id="mobile-notifications"
                    <Switch
                      id="mobile-notifications"
                      checked={formValues.notifications.mobile}
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "mobile", checked)
                      }
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "mobile", checked)
                      }
                    />
                  </div>
                </div>


                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>


                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label htmlFor="stock-alerts" className="text-sm">
                        Low Stock Alerts
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts when inventory items are running low
                      </p>
                      <label htmlFor="stock-alerts" className="text-sm">
                        Low Stock Alerts
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts when inventory items are running low
                      </p>
                    </div>
                    <Switch
                      id="stock-alerts"
                    <Switch
                      id="stock-alerts"
                      checked={formValues.notifications.stockAlerts}
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "stockAlerts", checked)
                      }
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "stockAlerts", checked)
                      }
                    />
                  </div>


                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label htmlFor="order-updates" className="text-sm">
                        Order Updates
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about new orders and status changes
                      </p>
                      <label htmlFor="order-updates" className="text-sm">
                        Order Updates
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about new orders and status changes
                      </p>
                    </div>
                    <Switch
                      id="order-updates"
                    <Switch
                      id="order-updates"
                      checked={formValues.notifications.orderUpdates}
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "orderUpdates", checked)
                      }
                      onCheckedChange={(checked) =>
                        handleChange("notifications", "orderUpdates", checked)
                      }
                    />
                  </div>


                  <div className="flex items-center justify-between py-2">
                    <div>
                      <label htmlFor="marketing-emails" className="text-sm">
                        Marketing Emails
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Receive newsletters, promotions and updates
                      </p>
                      <label htmlFor="marketing-emails" className="text-sm">
                        Marketing Emails
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Receive newsletters, promotions and updates
                      </p>
                    </div>
                    <Switch
                      id="marketing-emails"
                    <Switch
                      id="marketing-emails"
                      checked={formValues.notifications.marketingEmails}
                      onCheckedChange={(checked) =>
                        handleChange(
                          "notifications",
                          "marketingEmails",
                          checked
                        )
                      }
                      onCheckedChange={(checked) =>
                        handleChange(
                          "notifications",
                          "marketingEmails",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setFormValues(userData)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>Save Preferences</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "security" && (

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Password Update</h3>


                  <div className="grid gap-2">
                    <label className="text-sm">Current Password</label>
                    <input
                      type="password"
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>


                  <div className="grid gap-2">
                    <label className="text-sm">New Password</label>
                    <input
                      type="password"
                    <input
                      type="password"
                      placeholder="Enter a new password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>


                  <div className="grid gap-2">
                    <label className="text-sm">Confirm New Password</label>
                    <input
                      type="password"
                    <input
                      type="password"
                      placeholder="Confirm your new password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>


                  <Button className="mt-2">Update Password</Button>
                </div>


                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-medium">
                    Two-Factor Authentication
                  </h3>

                  <h3 className="text-sm font-medium">
                    Two-Factor Authentication
                  </h3>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm">Two-factor authentication</p>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to your account by
                        requiring more than just a password to sign in.
                        Add an extra layer of security to your account by
                        requiring more than just a password to sign in.
                      </p>
                    </div>
                    <Switch
                      id="two-factor"
                    <Switch
                      id="two-factor"
                      checked={formValues.twoFactorEnabled}
                      onCheckedChange={(checked) =>
                        setFormValues({
                          ...formValues,
                          twoFactorEnabled: checked,
                        })
                      }
                      onCheckedChange={(checked) =>
                        setFormValues({
                          ...formValues,
                          twoFactorEnabled: checked,
                        })
                      }
                    />
                  </div>


                  {formValues.twoFactorEnabled && (
                    <div className="p-4 rounded-md bg-muted">
                      <p className="text-sm">
                        Two-factor authentication is enabled. You will need to
                        enter a code from your authenticator app when signing
                        in.
                        Two-factor authentication is enabled. You will need to
                        enter a code from your authenticator app when signing
                        in.
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

                  <Button variant="destructive" size="sm">
                    Sign Out All Other Sessions
                  </Button>

                  <Button variant="destructive" size="sm">
                    Sign Out All Other Sessions
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setFormValues(userData)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>
                  Save Security Settings
                </Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "appearance" && (

          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Theme</h3>


                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm">Theme Settings</p>
                        <p className="text-xs text-muted-foreground">
                          {formValues.appearance.theme === "dark"
                            ? "Dark mode is currently enabled"
                            : "Dark mode is currently disabled"}
                        </p>
                      </div>
                    </div>
                  </div>


                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div
                      className={`p-4 border rounded-md ${
                        formValues.appearance.theme === "light"
                          ? "border-primary bg-muted/50"
                          : "border-muted"
                      } cursor-pointer`}
                      onClick={() =>
                        handleChange("appearance", "theme", "light")
                      }
                    >
                      <div className="h-20 bg-white border rounded-md mb-2"></div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </div>
                    <div
                      className={`p-4 border rounded-md ${
                        formValues.appearance.theme === "dark"
                          ? "border-primary bg-muted/50"
                          : "border-muted"
                      } cursor-pointer`}
                      onClick={() =>
                        handleChange("appearance", "theme", "dark")
                      }
                    >
                      <div className="h-20 bg-gray-900 border border-gray-700 rounded-md mb-2"></div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                    <div
                      className={`p-4 border rounded-md ${
                        formValues.appearance.theme === "system"
                          ? "border-primary bg-muted/50"
                          : "border-muted"
                      } cursor-pointer`}
                      onClick={() =>
                        handleChange("appearance", "theme", "system")
                      }
                    >
                      <div className="h-20 bg-gradient-to-r from-white to-gray-900 border rounded-md mb-2"></div>
                      <p className="text-sm font-medium text-center">System</p>
                    </div>
                  </div>
                </div>


                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-medium">Display Options</h3>


                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm">Compact Mode</p>
                      <p className="text-xs text-muted-foreground">
                        Display more information on screen with a more compact
                        layout
                        Display more information on screen with a more compact
                        layout
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                    <Switch
                      id="compact-mode"
                      checked={formValues.appearance.compactMode}
                      onCheckedChange={(checked) =>
                        handleChange("appearance", "compactMode", checked)
                      }
                      onCheckedChange={(checked) =>
                        handleChange("appearance", "compactMode", checked)
                      }
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
                    <Switch
                      id="animations"
                      checked={formValues.appearance.animationsEnabled}
                      onCheckedChange={(checked) =>
                        handleChange("appearance", "animationsEnabled", checked)
                      }
                      onCheckedChange={(checked) =>
                        handleChange("appearance", "animationsEnabled", checked)
                      }
                    />
                  </div>


                  <div className="grid gap-2 pt-2">
                    <label className="text-sm">Font Size</label>
                    <select
                    <select
                      value={formValues.appearance.fontSize}
                      onChange={(e) =>
                        handleChange("appearance", "fontSize", e.target.value)
                      }
                      onChange={(e) =>
                        handleChange("appearance", "fontSize", e.target.value)
                      }
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
                <Button
                  variant="outline"
                  onClick={() => setFormValues(userData)}
                >
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveChanges}>Save Preferences</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "language" && (

          {activeTab === "language" && (
            <Card>
              <CardHeader>
                <CardTitle>Language & Regional Settings</CardTitle>
                <CardDescription>
                  Configure language and regional preferences
                </CardDescription>
                <CardDescription>
                  Configure language and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Language</label>
                    <select
                      value={formValues.language || "en-US"}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          language: e.target.value,
                        })
                      }
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
                      value={formValues.timeZone || "America/New_York"}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          timeZone: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="America/New_York">
                        Eastern Time (US & Canada)
                      </option>
                      <option value="America/Chicago">
                        Central Time (US & Canada)
                      </option>
                      <option value="America/Denver">
                        Mountain Time (US & Canada)
                      </option>
                      <option value="America/Los_Angeles">
                        Pacific Time (US & Canada)
                      </option>
                      <option value="America/New_York">
                        Eastern Time (US & Canada)
                      </option>
                      <option value="America/Chicago">
                        Central Time (US & Canada)
                      </option>
                      <option value="America/Denver">
                        Mountain Time (US & Canada)
                      </option>
                      <option value="America/Los_Angeles">
                        Pacific Time (US & Canada)
                      </option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>


                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Date Format</label>
                    <select
                      value={formValues.dateFormat || "MM/DD/YYYY"}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          dateFormat: e.target.value,
                        })
                      }
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
                      value={formValues.currency || "PKR"}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          currency: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="PKR">PKR (₨)</option>
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
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Information
                      </h4>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Information
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Changing your language or regional settings will apply
                        to all aspects of your PestTrack experience, including
                        notifications, reports, and invoices.
                        Changing your language or regional settings will apply
                        to all aspects of your PestTrack experience, including
                        notifications, reports, and invoices.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setFormValues(userData)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            </Card>
          )}

          {activeTab === "backup" && (

          {activeTab === "backup" && (
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>
                  Manage data backup and restoration options
                </CardDescription>
                <CardDescription>
                  Manage data backup and restoration options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-md bg-muted">
                  <h3 className="text-sm font-medium">Backup Status</h3>


                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Auto-backup:</span>
                      <span className="text-sm font-medium">
                        {formValues.backup.autoBackup ? "Enabled" : "Disabled"}
                      </span>
                      <span className="text-sm font-medium">
                        {formValues.backup.autoBackup ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Frequency:</span>
                      <span className="text-sm font-medium capitalize">
                        {formValues.backup.backupFrequency}
                      </span>
                      <span className="text-sm font-medium capitalize">
                        {formValues.backup.backupFrequency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last backup:</span>
                      <span className="text-sm font-medium">
                        {formatDate(formValues.backup.lastBackup)}
                      </span>
                      <span className="text-sm font-medium">
                        {formatDate(formValues.backup.lastBackup)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next scheduled backup:</span>
                      <span className="text-sm font-medium">
                        {calculateNextBackup(formValues.backup)}
                      </span>
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
                    <Switch
                      id="auto-backup"
                      checked={formValues.backup.autoBackup}
                      onCheckedChange={(checked) =>
                        handleChange("backup", "autoBackup", checked)
                      }
                      onCheckedChange={(checked) =>
                        handleChange("backup", "autoBackup", checked)
                      }
                    />
                  </div>


                  {formValues.backup.autoBackup && (
                    <div className="grid gap-2 pl-8">
                      <label className="text-sm">Backup Frequency</label>
                      <select
                      <select
                        value={formValues.backup.backupFrequency}
                        onChange={(e) =>
                          handleChange(
                            "backup",
                            "backupFrequency",
                            e.target.value
                          )
                        }
                        onChange={(e) =>
                          handleChange(
                            "backup",
                            "backupFrequency",
                            e.target.value
                          )
                        }
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
                  <Button className="w-full" onClick={() => handleBackupNow()}>
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
                    Export your data in different formats for external use or
                    backup
                    Export your data in different formats for external use or
                    backup
                  </p>


                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm">
                      Export as CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      Export as Excel
                    </Button>
                    <Button variant="outline" size="sm">
                      Export as PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      Export as CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      Export as Excel
                    </Button>
                    <Button variant="outline" size="sm">
                      Export as PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setFormValues(userData)}
                >
                  Reset to Defaults
                </Button>
                <Button onClick={handleSaveChanges}>
                  Save Backup Settings
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate the next backup date
const calculateNextBackup = (backup) => {
  if (!backup || !backup.lastBackup || !backup.backupFrequency) {
    return "Not scheduled";
  }

  const lastBackup = new Date(backup.lastBackup);
  let nextBackup = new Date(lastBackup);

  switch (backup.backupFrequency) {
    case "daily":
      nextBackup.setDate(lastBackup.getDate() + 1);
      break;
    case "weekly":
      nextBackup.setDate(lastBackup.getDate() + 7);
      break;
    case "monthly":
      nextBackup.setMonth(lastBackup.getMonth() + 1);
      break;
    default:
      return "Unknown schedule";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(nextBackup);
};

export default Settings;

export default Settings;
