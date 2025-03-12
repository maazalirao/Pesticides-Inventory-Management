import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Plus, Edit, Trash, Phone, Mail, MapPin, User, Calendar } from 'lucide-react';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for customers
  const customers = [
    {
      id: 1,
      name: "Green Farms Ltd",
      type: "Business",
      contact: "Emily Johnson",
      email: "emily@greenfarms.com",
      phone: "+1 (555) 111-2233",
      address: "123 Farm Road, Rural County, TX 75001",
      joinDate: "2022-05-15",
      totalOrders: 24,
      totalSpent: 5680.75
    },
    {
      id: 2,
      name: "City Parks Department",
      type: "Government",
      contact: "James Wilson",
      email: "jwilson@cityparks.gov",
      phone: "+1 (555) 333-4455",
      address: "456 Municipal Way, Metro City, CA 90001",
      joinDate: "2022-07-22",
      totalOrders: 15,
      totalSpent: 8925.50
    },
    {
      id: 3,
      name: "Robert Greene",
      type: "Individual",
      contact: "Robert Greene",
      email: "robert.greene@email.com",
      phone: "+1 (555) 555-6677",
      address: "789 Orchard Lane, Springfield, IL 62701",
      joinDate: "2023-01-10",
      totalOrders: 6,
      totalSpent: 780.25
    },
    {
      id: 4,
      name: "Sunrise Orchards",
      type: "Business",
      contact: "Maria Gonzalez",
      email: "maria@sunriseorchards.com",
      phone: "+1 (555) 777-8899",
      address: "101 Apple Drive, Fruitvale, WA 98001",
      joinDate: "2023-03-05",
      totalOrders: 18,
      totalSpent: 4250.00
    },
    {
      id: 5,
      name: "Garden Services Inc",
      type: "Business",
      contact: "David Park",
      email: "david@gardenservices.com",
      phone: "+1 (555) 999-0011",
      address: "202 Landscape Blvd, Greenville, NC 27858",
      joinDate: "2022-10-18",
      totalOrders: 30,
      totalSpent: 12750.80
    },
    {
      id: 6,
      name: "Community College",
      type: "Educational",
      contact: "Susan Taylor",
      email: "staylor@communitycollege.edu",
      phone: "+1 (555) 222-3344",
      address: "303 Campus Road, College Town, NY 14850",
      joinDate: "2023-05-20",
      totalOrders: 8,
      totalSpent: 3450.60
    },
    {
      id: 7,
      name: "Jennifer Smith",
      type: "Individual",
      contact: "Jennifer Smith",
      email: "jsmith@email.com",
      phone: "+1 (555) 444-5566",
      address: "404 Residential Street, Hometown, OH 44101",
      joinDate: "2023-02-15",
      totalOrders: 4,
      totalSpent: 520.75
    },
    {
      id: 8,
      name: "Evergreen Nursery",
      type: "Business",
      contact: "Michael Brown",
      email: "michael@evergreennursery.com",
      phone: "+1 (555) 666-7788",
      address: "505 Plant Street, Gardenville, OR 97301",
      joinDate: "2022-08-10",
      totalOrders: 22,
      totalSpent: 7350.25
    },
  ];

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    return (
      searchTerm === '' ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Function to get customer type badge color
  const getTypeColor = (type) => {
    switch (type) {
      case 'Business':
        return 'bg-blue-100 text-blue-800';
      case 'Individual':
        return 'bg-purple-100 text-purple-800';
      case 'Government':
        return 'bg-green-100 text-green-800';
      case 'Educational':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage your customers and their purchase history
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Customer
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customers..."
                className="pl-10 w-full rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="py-3 px-4 text-left font-medium">Customer</th>
                  <th className="py-3 px-4 text-left font-medium">Type</th>
                  <th className="py-3 px-4 text-left font-medium">Contact Info</th>
                  <th className="py-3 px-4 text-left font-medium">Join Date</th>
                  <th className="py-3 px-4 text-left font-medium">Orders</th>
                  <th className="py-3 px-4 text-left font-medium">Total Spent</th>
                  <th className="py-3 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/25">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(customer.type)}`}>
                        {customer.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <User className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{customer.contact}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{formatDate(customer.joinDate)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{customer.totalOrders}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1 rounded-md hover:bg-muted">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                        <button className="p-1 rounded-md hover:bg-muted">
                          <Trash className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Customers; 