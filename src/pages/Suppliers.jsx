import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Search, Plus, Edit, Trash, Phone, Mail, MapPin } from 'lucide-react';

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for suppliers
  const suppliers = [
    {
      id: 1,
      name: "AgriChem Inc",
      contact: "John Smith",
      email: "j.smith@agrichem.com",
      phone: "+1 (555) 123-4567",
      address: "123 Industrial Park, Chicago, IL 60007",
      categories: ["Insecticide", "Herbicide"],
      status: "Active"
    },
    {
      id: 2,
      name: "GreenTech Solutions",
      contact: "Sarah Johnson",
      email: "sarah@greentech.com",
      phone: "+1 (555) 987-6543",
      address: "456 Research Blvd, Boston, MA 02108",
      categories: ["Herbicide", "Fungicide"],
      status: "Active"
    },
    {
      id: 3,
      name: "PlantHealth Systems",
      contact: "Michael Chen",
      email: "m.chen@planthealth.com",
      phone: "+1 (555) 234-5678",
      address: "789 Science Drive, San Francisco, CA 94107",
      categories: ["Fungicide"],
      status: "Active"
    },
    {
      id: 4,
      name: "PestStop International",
      contact: "David Rodriguez",
      email: "david@peststop.com",
      phone: "+1 (555) 345-6789",
      address: "101 Distribution Center, Austin, TX 78701",
      categories: ["Insecticide", "Rodenticide"],
      status: "Active"
    },
    {
      id: 5,
      name: "Pest Defense Ltd",
      contact: "Lisa Williams",
      email: "lisa@pestdefense.com",
      phone: "+1 (555) 456-7890",
      address: "202 Manufacturing Lane, Denver, CO 80014",
      categories: ["Insecticide"],
      status: "Inactive"
    },
    {
      id: 6,
      name: "HealthGuard Solutions",
      contact: "Robert Lee",
      email: "r.lee@healthguard.com",
      phone: "+1 (555) 567-8901",
      address: "303 Laboratory Road, Seattle, WA 98101",
      categories: ["Insecticide", "Fungicide"],
      status: "Active"
    },
    {
      id: 7,
      name: "EcoShield Products",
      contact: "Amanda Garcia",
      email: "a.garcia@ecoshield.com",
      phone: "+1 (555) 678-9012",
      address: "404 Green Street, Portland, OR 97201",
      categories: ["Herbicide", "Fungicide"],
      status: "Active"
    },
    {
      id: 8,
      name: "AgriPro Supplies",
      contact: "Thomas Wilson",
      email: "t.wilson@agripro.com",
      phone: "+1 (555) 789-0123",
      address: "505 Farm Road, Minneapolis, MN 55403",
      categories: ["Herbicide", "Insecticide", "Fungicide"],
      status: "Inactive"
    },
  ];

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter((supplier) => {
    return (
      searchTerm === '' ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Management</h1>
          <p className="text-muted-foreground">
            Manage your pesticide suppliers and contacts
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Supplier
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Suppliers</CardTitle>
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
                placeholder="Search suppliers..."
                className="pl-10 w-full rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className={`h-2 w-full ${supplier.status === "Active" ? "bg-green-500" : "bg-red-500"}`}></div>
                  <div className="p-6">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-lg">{supplier.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {supplier.status}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{supplier.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex text-sm">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1 flex-shrink-0" />
                        <span>{supplier.address}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {supplier.categories.map((category, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex gap-2 justify-end">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50">
                        <Trash className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No suppliers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers; 