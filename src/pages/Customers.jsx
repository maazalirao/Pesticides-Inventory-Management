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
      name: "Al-Barakat Farms",
      type: "Business",
      contact: "Muhammad Ibrahim",
      email: "ibrahim@albarakat.com",
      phone: "+92 (301) 123-4567",
      address: "123 Agriculture Road, Multan, Punjab",
      joinDate: "2022-05-15",
      totalOrders: 24,
      totalSpent: 568075
    },
    {
      id: 2,
      name: "City Parks Authority",
      type: "Government",
      contact: "Usman Khan",
      email: "usman.khan@cda.gov.pk",
      phone: "+92 (333) 987-6543",
      address: "456 Municipal Complex, Islamabad",
      joinDate: "2022-07-22",
      totalOrders: 15,
      totalSpent: 892550
    },
    {
      id: 3,
      name: "Maaz Ali",
      type: "Individual",
      contact: "Maaz Ali",
      email: "maaz.ahmed@gmail.com",
      phone: "+92 (321) 234-5678",
      address: "789 Garden Town, Lahore, Punjab",
      joinDate: "2023-01-10",
      totalOrders: 6,
      totalSpent: 78025
    },
    {
      id: 4,
      name: "Rehman Orchards",
      type: "Business",
      contact: "Abdul Rehman",
      email: "rehman@orchards.pk",
      phone: "+92 (300) 111-2233",
      address: "101 Fruit Market Road, Swat, KPK",
      joinDate: "2023-03-05",
      totalOrders: 18,
      totalSpent: 425000
    },
    {
      id: 5,
      name: "Green Pakistan Services",
      type: "Business",
      contact: "Jamal Malik",
      email: "jamal@greenpak.com",
      phone: "+92 (313) 444-5566",
      address: "202 Commercial Area, Karachi, Sindh",
      joinDate: "2022-10-18",
      totalOrders: 30,
      totalSpent: 1275080
    },
    {
      id: 6,
      name: "Agriculture University",
      type: "Educational",
      contact: "Dr. Mudasir Khan",
      email: "mudasir@agri.edu.pk",
      phone: "+92 (345) 777-8899",
      address: "303 University Road, Faisalabad, Punjab",
      joinDate: "2023-05-20",
      totalOrders: 8,
      totalSpent: 345060
    },
    {
      id: 7,
      name: "Umar Farooq",
      type: "Individual",
      contact: "Umar Farooq",
      email: "umar.farooq@gmail.com",
      phone: "+92 (332) 876-5432",
      address: "404 Model Town, Sialkot, Punjab",
      joinDate: "2023-02-15",
      totalOrders: 4,
      totalSpent: 52075
    },
    {
      id: 8,
      name: "Al-Madina Nursery",
      type: "Business",
      contact: "Hassan Ali",
      email: "hassan@almadinanursery.pk",
      phone: "+92 (311) 222-3344",
      address: "505 Nursery Road, Rawalpindi, Punjab",
      joinDate: "2022-08-10",
      totalOrders: 22,
      totalSpent: 735025
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
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR'
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
          <h1 className="hidden md:block text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="hidden md:block text-muted-foreground">
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