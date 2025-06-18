// Mock data for fallback when API fails
export const mockProducts = [
  {
    _id: 'mock_1',
    id: 'mock_1',
    name: 'Premium Insecticide - CyperMax',
    description: 'High-quality broad spectrum insecticide for crop protection. Effective against aphids, thrips, and other pests.',
    category: 'Insecticides',
    price: 2500,
    stock: 45,
    threshold: 10,
    sku: 'INS-001',
    image: 'https://placehold.co/400x300/22c55e/FFFFFF/png?text=CyperMax',
    usage: 'Agricultural',
    status: 'active',
    featured: true,
    store: {
      _id: 'mock_store_1',
      name: 'AgriCorp Main Store'
    }
  },
  {
    _id: 'mock_2',
    id: 'mock_2',
    name: 'GrowthMax Fertilizer NPK 20-20-20',
    description: 'Complete NPK fertilizer for balanced plant nutrition. Suitable for all crop types.',
    category: 'Fertilizers',
    price: 1800,
    stock: 62,
    threshold: 15,
    sku: 'FER-001',
    image: 'https://placehold.co/400x300/10b981/FFFFFF/png?text=GrowthMax',
    usage: 'Agricultural',
    status: 'active',
    featured: true,
    store: {
      _id: 'mock_store_1',
      name: 'AgriCorp Main Store'
    }
  },
  {
    _id: 'mock_3',
    id: 'mock_3',
    name: 'FungiShield - Fungicide Spray',
    description: 'Protective fungicide for preventing and treating fungal diseases in crops.',
    category: 'Fungicides',
    price: 3200,
    stock: 28,
    threshold: 8,
    sku: 'FUN-001',
    image: 'https://placehold.co/400x300/8b5cf6/FFFFFF/png?text=FungiShield',
    usage: 'Agricultural',
    status: 'active',
    featured: false,
    store: {
      _id: 'mock_store_2',
      name: 'GreenTech Solutions'
    }
  },
  {
    _id: 'mock_4',
    id: 'mock_4',
    name: 'WeedKiller Pro - Herbicide',
    description: 'Systemic herbicide for controlling annual and perennial weeds.',
    category: 'Herbicides',
    price: 2100,
    stock: 0,
    threshold: 12,
    sku: 'HER-001',
    image: 'https://placehold.co/400x300/3b82f6/FFFFFF/png?text=WeedKiller',
    usage: 'Agricultural',
    status: 'active',
    featured: true,
    store: {
      _id: 'mock_store_1',
      name: 'AgriCorp Main Store'
    }
  },
  {
    _id: 'mock_5',
    id: 'mock_5',
    name: 'RodentMax Bait Station',
    description: 'Professional rodenticide bait station for farm and warehouse use.',
    category: 'Rodenticides',
    price: 1500,
    stock: 18,
    threshold: 5,
    sku: 'ROD-001',
    image: 'https://placehold.co/400x300/f97316/FFFFFF/png?text=RodentMax',
    usage: 'Commercial',
    status: 'active',
    featured: false,
    store: {
      _id: 'mock_store_2',
      name: 'GreenTech Solutions'
    }
  },
  {
    _id: 'mock_6',
    id: 'mock_6',
    name: 'OrganicGrow Liquid Fertilizer',
    description: 'Organic liquid fertilizer enriched with micronutrients for healthy plant growth.',
    category: 'Fertilizers',
    price: 2800,
    stock: 35,
    threshold: 10,
    sku: 'ORG-001',
    image: 'https://placehold.co/400x300/84cc16/FFFFFF/png?text=OrganicGrow',
    usage: 'Organic',
    status: 'active',
    featured: true,
    store: {
      _id: 'mock_store_3',
      name: 'Organic Farm Supply'
    }
  }
];

export const mockInventory = [
  {
    _id: 'inv_mock_1',
    name: 'Premium Insecticide - CyperMax',
    sku: 'INS-001',
    category: 'Pesticide',
    quantity: 45,
    unit: 'Liter',
    price: 2500,
    threshold: 10,
    status: 'In Stock',
    supplier: 'ChemCorp Ltd',
    store: 'mock_store_1',
    batches: [
      {
        batchId: 'BATCH-2024-001',
        lotNumber: 'LOT-INS-2024-A',
        manufacturingDate: '2024-01-15',
        expiryDate: '2026-01-15',
        quantity: 25,
        supplier: 'ChemCorp Ltd',
        locationCode: 'A-01-05'
      }
    ]
  },
  {
    _id: 'inv_mock_2',
    name: 'GrowthMax Fertilizer NPK',
    sku: 'FER-001',
    category: 'Fertilizer',
    quantity: 62,
    unit: 'Kilogram',
    price: 1800,
    threshold: 15,
    status: 'In Stock',
    supplier: 'NutriPlant Industries',
    store: 'mock_store_1',
    batches: []
  },
  {
    _id: 'inv_mock_3',
    name: 'WeedKiller Pro - Herbicide',
    sku: 'HER-001',
    category: 'Pesticide',
    quantity: 0,
    unit: 'Liter',
    price: 2100,
    threshold: 12,
    status: 'Out of Stock',
    supplier: 'AgriChem Solutions',
    store: 'mock_store_1',
    batches: []
  },
  {
    _id: 'inv_mock_4',
    name: 'FungiShield Spray',
    sku: 'FUN-001',
    category: 'Pesticide',
    quantity: 8,
    unit: 'Liter',
    price: 3200,
    threshold: 8,
    status: 'Low Stock',
    supplier: 'BioDefense Corp',
    store: 'mock_store_2',
    batches: []
  }
];

export const mockCustomers = [
  {
    _id: 'cust_mock_1',
    name: 'Muhammad Ahmad',
    email: 'ahmad.farmer@email.com',
    phone: '+92-300-1234567',
    address: {
      street: '123 Farm Road',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan'
    },
    paymentMethod: 'Cash on Delivery',
    taxId: 'TAX-001234',
    notes: 'Regular customer - bulk orders',
    isActive: true,
    customerType: 'Farmer',
    lastOrderDate: '2024-01-15',
    store: 'mock_store_1'
  },
  {
    _id: 'cust_mock_2',
    name: 'Fatima Begum',
    email: 'fatima.organic@email.com',
    phone: '+92-301-2345678',
    address: {
      street: '456 Green Valley',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75000',
      country: 'Pakistan'
    },
    paymentMethod: 'Bank Transfer',
    taxId: 'TAX-002345',
    notes: 'Organic farming specialist',
    isActive: true,
    customerType: 'Organic Farmer',
    lastOrderDate: '2024-01-10',
    store: 'mock_store_1'
  },
  {
    _id: 'cust_mock_3',
    name: 'Ali Hassan Distributors',
    email: 'info@alihassandist.com',
    phone: '+92-302-3456789',
    address: {
      street: '789 Industrial Area',
      city: 'Faisalabad',
      state: 'Punjab',
      zipCode: '38000',
      country: 'Pakistan'
    },
    paymentMethod: 'Credit',
    taxId: 'TAX-003456',
    notes: 'Wholesale distributor',
    isActive: true,
    customerType: 'Distributor',
    lastOrderDate: '2024-01-18',
    store: 'mock_store_2'
  }
];

export const mockSuppliers = [
  {
    _id: 'supp_mock_1',
    name: 'ChemCorp Ltd',
    contactPerson: 'Dr. Rashid Ahmed',
    email: 'contact@chemcorp.com',
    phone: '+92-42-1234567',
    address: {
      street: '15 Industrial Zone',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan'
    },
    taxId: 'TAX-SUPP-001',
    paymentTerms: 'Net 30 days',
    notes: 'Primary supplier for insecticides',
    isActive: true
  },
  {
    _id: 'supp_mock_2',
    name: 'NutriPlant Industries',
    contactPerson: 'Ms. Sarah Khan',
    email: 'sales@nutriplant.com',
    phone: '+92-21-2345678',
    address: {
      street: '22 Agricultural Hub',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75000',
      country: 'Pakistan'
    },
    taxId: 'TAX-SUPP-002',
    paymentTerms: 'Net 45 days',
    notes: 'Fertilizer and nutrient specialist',
    isActive: true
  },
  {
    _id: 'supp_mock_3',
    name: 'BioDefense Corp',
    contactPerson: 'Mr. Imran Ali',
    email: 'info@biodefense.com',
    phone: '+92-51-3456789',
    address: {
      street: '33 Research Park',
      city: 'Islamabad',
      state: 'Federal',
      zipCode: '44000',
      country: 'Pakistan'
    },
    taxId: 'TAX-SUPP-003',
    paymentTerms: 'Net 15 days',
    notes: 'Biological and organic solutions',
    isActive: true
  }
];

export const mockStores = [
  {
    _id: 'mock_store_1',
    name: 'AgriCorp Main Store',
    location: 'Lahore, Punjab',
    manager: 'Ahmad Ali',
    phone: '+92-42-1111111',
    email: 'lahore@agricorp.com',
    status: 'active'
  },
  {
    _id: 'mock_store_2',
    name: 'GreenTech Solutions',
    location: 'Karachi, Sindh',
    manager: 'Fatima Shah',
    phone: '+92-21-2222222',
    email: 'karachi@greentech.com',
    status: 'active'
  },
  {
    _id: 'mock_store_3',
    name: 'Organic Farm Supply',
    location: 'Islamabad, Federal',
    manager: 'Hassan Ahmed',
    phone: '+92-51-3333333',
    email: 'islamabad@organicfarm.com',
    status: 'active'
  }
];

export const mockDashboardStats = [
  {
    title: "Total Products",
    value: "156",
    description: "Products across all stores",
    icon: "Package",
    iconClass: "bg-blue-100 text-blue-600",
    change: "+12% from last month",
    changeType: "positive"
  },
  {
    title: "Low Stock Items",
    value: "8",
    description: "Products below minimum threshold",
    icon: "AlertTriangle",
    iconClass: "bg-yellow-100 text-yellow-600",
    change: "2 out of stock",
    changeType: "negative"
  },
  {
    title: "Total Revenue",
    value: "PKR 485,000",
    description: "Total inventory value",
    icon: "DollarSign",
    iconClass: "bg-green-100 text-green-600",
    change: "+8.5% from last month",
    changeType: "positive"
  },
  {
    title: "Active Stores",
    value: "3",
    description: "Operational store locations",
    icon: "Store",
    iconClass: "bg-purple-100 text-purple-600",
    change: "All stores operational",
    changeType: "positive"
  }
];

export const mockSalesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Sales (PKR)',
      data: [45000, 52000, 48000, 61000, 55000, 58000],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
    },
  ],
};

export const mockInventoryDistribution = {
  labels: ['Insecticides', 'Fertilizers', 'Fungicides', 'Herbicides', 'Rodenticides'],
  datasets: [
    {
      data: [35, 25, 20, 15, 5],
      backgroundColor: [
        '#22c55e',
        '#10b981',
        '#8b5cf6',
        '#3b82f6',
        '#f97316',
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    },
  ],
};

// Helper function to get mock data with proper structure
export const getMockProducts = () => mockProducts;
export const getMockInventory = () => mockInventory;
export const getMockCustomers = () => mockCustomers;
export const getMockSuppliers = () => mockSuppliers;
export const getMockStores = () => mockStores;
export const getMockDashboardStats = () => mockDashboardStats;
export const getMockSalesData = () => mockSalesData;
export const getMockInventoryDistribution = () => mockInventoryDistribution; 