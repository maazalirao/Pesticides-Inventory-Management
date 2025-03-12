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
      name: "Al-Faisal Chemicals",
      contact: "Muhammad Akram",
      email: "akram@alfaisal.pk",
      phone: "+92 (301) 456-7890",
      address: "123 Industrial Area, Lahore, Punjab",
      categories: ["Insecticide", "Herbicide"],
      status: "Active"
    },
    {
      id: 2,
      name: "Malik Agro Solutions",
      contact: "Zubair Malik",
      email: "zubair@malikagro.pk",
      phone: "+92 (333) 765-4321",
      address: "456 Research Center, Islamabad",
      categories: ["Herbicide", "Fungicide"],
      status: "Active"
    },
    {
      id: 3,
      name: "Khan Agricultural Products",
      contact: "Shahid Khan",
      email: "shahid@khanagri.pk",
      phone: "+92 (321) 234-5678",
      address: "789 Business Park, Karachi, Sindh",
      categories: ["Fungicide"],
      status: "Active"
    },
    {
      id: 4,
      name: "Ahsan Brothers Trading",
      contact: "Bilal Ahsan",
      email: "bilal@ahsanbrothers.pk",
      phone: "+92 (345) 678-9012",
      address: "101 Distribution Hub, Rawalpindi, Punjab",
      categories: ["Insecticide", "Rodenticide"],
      status: "Active"
    },
    {
      id: 5,
      name: "Rashid Pest Control Supplies",
      contact: "Usman Rashid",
      email: "usman@rashidpest.pk",
      phone: "+92 (311) 234-5678",
      address: "202 Manufacturing Zone, Faisalabad, Punjab",
      categories: ["Insecticide"],
      status: "Inactive"
    },
    {
      id: 6,
      name: "Iqbal Agricultural Solutions",
      contact: "Asad Iqbal",
      email: "asad@iqbalagri.pk",
      phone: "+92 (302) 876-5432",
      address: "303 Research Road, Multan, Punjab",
      categories: ["Insecticide", "Fungicide"],
      status: "Active"
    },
    {
      id: 7,
      name: "Khan Organic Fertilizers",
      contact: "Farhan Ahmed",
      email: "farhan@khanorganic.pk",
      phone: "+92 (334) 987-6543",
      address: "404 Green Valley, Peshawar, KPK",
      categories: ["Herbicide", "Fungicide"],
      status: "Active"
    },
    {
      id: 8,
      name: "Pak Agri Supplies",
      contact: "Tariq Mehmood",
      email: "tariq@pakagri.pk",
      phone: "+92 (300) 123-4567",
      address: "505 Farm Center, Sialkot, Punjab",
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="hidden md:block text-2xl md:text-3xl font-bold tracking-tight">Supplier Management</h1>
          <p className="hidden md:block text-muted-foreground">
            Manage your pesticide suppliers and contacts
          </p>
        </div>
        <Button className="flex items-center gap-2 whitespace-nowrap">
          <Plus className="h-4 w-4" />
          <span>Add Supplier</span>
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
                className="pl-10 w-full rounded-md border border-input bg-background py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="overflow-hidden relative">
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{supplier.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.status === "Active" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {supplier.status}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                    
                    <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-muted-foreground flex-shrink-0" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex">
                        <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{supplier.address}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 sm:mt-4">
                      <p className="text-xs text-muted-foreground mb-1.5">Categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {supplier.categories.map((category, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-6 flex gap-2 justify-end">
                      <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2.5 sm:px-3">
                        <Edit className="h-3 w-3" />
                        <span className="sm:inline">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-2.5 sm:px-3 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950">
                        <Trash className="h-3 w-3" />
                        <span className="sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Bottom color indicator */}
                  <div className={`absolute bottom-0 left-0 right-0 h-2 ${
                    supplier.status === "Active" 
                      ? 'bg-gradient-to-r from-orange-200 to-orange-500 dark:from-orange-900 dark:to-orange-600'
                      : 'bg-gradient-to-r from-red-200 to-red-500 dark:from-red-900 dark:to-red-600'
                  }`}></div>
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