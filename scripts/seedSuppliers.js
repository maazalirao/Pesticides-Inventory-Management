import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Supplier from '../server/models/supplierModel.js';
import Store from '../server/models/storeModel.js';
import connectDB from '../server/config/db.js';

dotenv.config();

// Expanded list of supplier templates without store reference
const supplierTemplates = [
  {
    name: "Al-Faisal Chemicals",
    contactPerson: "Muhammad Akram",
    email: "akram@alfaisal.pk",
    phone: "+92 (301) 456-7890",
    address: {
      street: "123 Industrial Area",
      city: "Lahore",
      state: "Punjab",
      zipCode: "54000",
      country: "Pakistan"
    },
    taxId: "NTN-1234567",
    paymentTerms: "Net 30",
    notes: "Primary supplier for insecticides and herbicides",
    isActive: true
  },
  {
    name: "Malik Agro Solutions",
    contactPerson: "Zubair Malik",
    email: "zubair@malikagro.pk",
    phone: "+92 (333) 765-4321",
    address: {
      street: "456 Research Center",
      city: "Islamabad",
      state: "Federal Capital",
      zipCode: "44000",
      country: "Pakistan"
    },
    taxId: "NTN-7654321",
    paymentTerms: "Net 45",
    notes: "Specialized in organic pesticides",
    isActive: true
  },
  {
    name: "Khan Agricultural Products",
    contactPerson: "Shahid Khan",
    email: "shahid@khanagri.pk",
    phone: "+92 (321) 234-5678",
    address: {
      street: "789 Business Park",
      city: "Karachi",
      state: "Sindh",
      zipCode: "74000",
      country: "Pakistan"
    },
    taxId: "NTN-2345678",
    paymentTerms: "Net 60",
    notes: "Leading supplier of fungicides",
    isActive: true
  },
  {
    name: "Ahsan Brothers Trading",
    contactPerson: "Bilal Ahsan",
    email: "bilal@ahsanbrothers.pk",
    phone: "+92 (345) 678-9012",
    address: {
      street: "101 Distribution Hub",
      city: "Rawalpindi",
      state: "Punjab",
      zipCode: "46000",
      country: "Pakistan"
    },
    taxId: "NTN-3456789",
    paymentTerms: "Net 30",
    notes: "Comprehensive pesticide solutions",
    isActive: true
  },
  {
    name: "Rashid Pest Control Supplies",
    contactPerson: "Usman Rashid",
    email: "usman@rashidpest.pk",
    phone: "+92 (311) 234-5678",
    address: {
      street: "202 Manufacturing Zone",
      city: "Faisalabad",
      state: "Punjab",
      zipCode: "38000",
      country: "Pakistan"
    },
    taxId: "NTN-4567890",
    paymentTerms: "Net 45",
    notes: "Specialized in rodent control products",
    isActive: true
  },
  {
    name: "Iqbal Agricultural Solutions",
    contactPerson: "Asad Iqbal",
    email: "asad@iqbalagri.pk",
    phone: "+92 (302) 876-5432",
    address: {
      street: "303 Research Road",
      city: "Multan",
      state: "Punjab",
      zipCode: "60000",
      country: "Pakistan"
    },
    taxId: "NTN-5678901",
    paymentTerms: "Net 30",
    notes: "Innovative pest control solutions",
    isActive: true
  },
  {
    name: "Khan Organic Fertilizers",
    contactPerson: "Farhan Ahmed",
    email: "farhan@khanorganic.pk",
    phone: "+92 (334) 987-6543",
    address: {
      street: "404 Green Valley",
      city: "Peshawar",
      state: "KPK",
      zipCode: "25000",
      country: "Pakistan"
    },
    taxId: "NTN-6789012",
    paymentTerms: "Net 45",
    notes: "Organic pesticide solutions",
    isActive: true
  },
  {
    name: "Pak Agri Supplies",
    contactPerson: "Tariq Mehmood",
    email: "tariq@pakagri.pk",
    phone: "+92 (300) 123-4567",
    address: {
      street: "505 Farm Center",
      city: "Sialkot",
      state: "Punjab",
      zipCode: "51310",
      country: "Pakistan"
    },
    taxId: "NTN-7890123",
    paymentTerms: "Net 60",
    notes: "Complete agricultural solutions",
    isActive: true
  },
  {
    name: "Global Pest Solutions",
    contactPerson: "Imran Sheikh",
    email: "imran@globalpest.pk",
    phone: "+92 (313) 222-3333",
    address: {
      street: "707 Industrial Zone",
      city: "Gujranwala",
      state: "Punjab",
      zipCode: "52250",
      country: "Pakistan"
    },
    taxId: "NTN-9012345",
    paymentTerms: "Net 30",
    notes: "International standard pest control products",
    isActive: true
  },
  {
    name: "Green Earth Biologicals",
    contactPerson: "Saad Raza",
    email: "saad@greenearth.pk",
    phone: "+92 (315) 444-5555",
    address: {
      street: "808 Science Park",
      city: "Hyderabad",
      state: "Sindh",
      zipCode: "71000",
      country: "Pakistan"
    },
    taxId: "NTN-0123456",
    paymentTerms: "Net 45",
    notes: "Eco-friendly biological controls",
    isActive: true
  },
  {
    name: "AgriTech Solutions",
    contactPerson: "Ali Hassan",
    email: "ali@agritech.pk",
    phone: "+92 (317) 666-7777",
    address: {
      street: "909 Tech Valley",
      city: "Quetta",
      state: "Balochistan",
      zipCode: "87300",
      country: "Pakistan"
    },
    taxId: "NTN-1234509",
    paymentTerms: "Net 30",
    notes: "Modern agricultural technology provider",
    isActive: true
  },
  {
    name: "FarmChem Industries",
    contactPerson: "Yasin Khan",
    email: "yasin@farmchem.pk",
    phone: "+92 (319) 888-9999",
    address: {
      street: "101 Chemical Road",
      city: "Bahawalpur",
      state: "Punjab",
      zipCode: "63100",
      country: "Pakistan"
    },
    taxId: "NTN-2345610",
    paymentTerms: "Net 45",
    notes: "Agricultural chemicals specialist",
    isActive: true
  },
  {
    name: "BioDefend Ltd",
    contactPerson: "Naveed Ahmed",
    email: "naveed@biodefend.pk",
    phone: "+92 (321) 111-2222",
    address: {
      street: "202 Organic Lane",
      city: "Sukkur",
      state: "Sindh",
      zipCode: "65200",
      country: "Pakistan"
    },
    taxId: "NTN-3456711",
    paymentTerms: "Net 30",
    notes: "Organic pest control solutions",
    isActive: true
  },
  {
    name: "PestGuard Solutions",
    contactPerson: "Kamran Ali",
    email: "kamran@pestguard.pk",
    phone: "+92 (323) 333-4444",
    address: {
      street: "303 Guard Street",
      city: "Sargodha",
      state: "Punjab",
      zipCode: "40100",
      country: "Pakistan"
    },
    taxId: "NTN-4567812",
    paymentTerms: "Net 60",
    notes: "Complete pest management solutions",
    isActive: true
  }
];

const seedSuppliers = async () => {
  try {
    // Connect to MongoDB using the existing configuration
    await connectDB();
    console.log('MongoDB Connected');

    // Get all stores
    const stores = await Store.find({});
    
    if (stores.length === 0) {
      console.error('No stores found. Please run seedStores.js first.');
      process.exit(1);
    }
    
    console.log(`Found ${stores.length} stores to distribute suppliers`);

    // Clear existing suppliers
    await Supplier.deleteMany({});
    console.log('Cleared existing suppliers');

    // Array to hold all suppliers with store assignments
    const allSuppliers = [];
    
    // Loop through each store
    for (const store of stores) {
      console.log(`Creating 5 suppliers for store: ${store.name}`);
      
      // Take only 5 suppliers for each store
      for (let i = 0; i < 5; i++) {
        const template = supplierTemplates[i % supplierTemplates.length];
        
        // Create store-specific email to ensure uniqueness
        const storePrefix = store._id.toString().substring(0, 3);
        const email = `${storePrefix}-${i}${template.email}`;
        
        // Create store-specific supplier with a unique name
        const supplierName = `${store.name.split(' ')[0]}'s ${template.name}`;
        
        allSuppliers.push({
          ...template,
          name: supplierName,
          email,
          store: store._id
        });
      }
    }

    // Insert all suppliers
    const insertedSuppliers = await Supplier.insertMany(allSuppliers);
    console.log(`Successfully inserted ${insertedSuppliers.length} suppliers`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the script
seedSuppliers(); 