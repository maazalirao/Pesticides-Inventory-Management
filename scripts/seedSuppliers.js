// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import Supplier from '../server/models/supplierModel.js';
// import connectDB from '../server/config/db.js';

// dotenv.config();

// const suppliers = [
//   {
//     name: "Al-Faisal Chemicals",
//     contactPerson: "Muhammad Akram",
//     email: "akram@alfaisal.pk",
//     phone: "+92 (301) 456-7890",
//     address: {
//       street: "123 Industrial Area",
//       city: "Lahore",
//       state: "Punjab",
//       zipCode: "54000",
//       country: "Pakistan"
//     },
//     taxId: "NTN-1234567",
//     paymentTerms: "Net 30",
//     notes: "Primary supplier for insecticides and herbicides",
//     isActive: true
//   },
//   {
//     name: "Malik Agro Solutions",
//     contactPerson: "Zubair Malik",
//     email: "zubair@malikagro.pk",
//     phone: "+92 (333) 765-4321",
//     address: {
//       street: "456 Research Center",
//       city: "Islamabad",
//       state: "Federal Capital",
//       zipCode: "44000",
//       country: "Pakistan"
//     },
//     taxId: "NTN-7654321",
//     paymentTerms: "Net 45",
//     notes: "Specialized in organic pesticides",
//     isActive: true
//   },
//   {
//     name: "Khan Agricultural Products",
//     contactPerson: "Shahid Khan",
//     email: "shahid@khanagri.pk",
//     phone: "+92 (321) 234-5678",
//     address: {
//       street: "789 Business Park",
//       city: "Karachi",
//       state: "Sindh",
//       zipCode: "74000",
//       country: "Pakistan"
//     },
//     taxId: "NTN-2345678",
//     paymentTerms: "Net 60",
//     notes: "Leading supplier of fungicides",
//     isActive: true
//   },
//   {
//     name: "Ahsan Brothers Trading",
//     contactPerson: "Bilal Ahsan",
//     email: "bilal@ahsanbrothers.pk",
//     phone: "+92 (345) 678-9012",
//     address: {
//       street: "101 Distribution Hub",
//       city: "Rawalpindi",
//       state: "Punjab",
//       zipCode: "46000",
//       country: "Pakistan"
//     },
//     taxId: "NTN-3456789",
//     paymentTerms: "Net 30",
//     notes: "Comprehensive pesticide solutions",
//     isActive: true
//   },
//   {
//     name: "Rashid Pest Control Supplies",
//     contactPerson: "Usman Rashid",
//     email: "usman@rashidpest.pk",
//     phone: "+92 (311) 234-5678",
//     address: {
//       street: "202 Manufacturing Zone",
//       city: "Faisalabad",
//       state: "Punjab",
//       zipCode: "38000",
//       country: "Pakistan"
//     },
//     taxId: "NTN-4567890",
//     paymentTerms: "Net 45",
//     notes: "Specialized in rodent control products",
//     isActive: false
//   },
//   {
//     name: "Iqbal Agricultural Solutions",
//     contactPerson: "Asad Iqbal",
//     email: "asad@iqbalagri.pk",
//     phone: "+92 (302) 876-5432",
//     address: {
//       street: "303 Research Road",
//       city: "Multan",
//       state: "Punjab",
//       zipCode: "60000",
//       country: "Pakistan"
//     },
//     taxId: "NTN-5678901",
//     paymentTerms: "Net 30",
//     notes: "Innovative pest control solutions",
//     isActive: true
//   },
//   {
//     name: "Khan Organic Fertilizers",
//     contactPerson: "Farhan Ahmed",
//     email: "farhan@khanorganic.pk",
//     phone: "+92 (334) 987-6543",
//     address: {
//       street: "404 Green Valley",
//       city: "Peshawar",
//       state: "KPK",
//       zipCode: "25000",
//       country: "Pakistan"
//     },
//     taxId: "NTN-6789012",
//     paymentTerms: "Net 45",
//     notes: "Organic pesticide solutions",
//     isActive: true
//   },
//   {
//     name: "Pak Agri Supplies",
//     contactPerson: "Tariq Mehmood",
//     email: "tariq@pakagri.pk",
//     phone: "+92 (300) 123-4567",
//     address: {
//       street: "505 Farm Center",
//       city: "Sialkot",
//       state: "Punjab",
//       zipCode: "51310",
//       country: "Pakistan"
//     },
//     taxId: "NTN-7890123",
//     paymentTerms: "Net 60",
//     notes: "Complete agricultural solutions",
//     isActive: false
//   }
// ];

// const seedSuppliers = async () => {
//   try {
//     // Connect to MongoDB using the existing configuration
//     await connectDB();
//     console.log('MongoDB Connected');

//     // Clear existing suppliers
//     await Supplier.deleteMany({});
//     console.log('Cleared existing suppliers');

//     // Insert new suppliers
//     const insertedSuppliers = await Supplier.insertMany(suppliers);
//     console.log(`Successfully inserted ${insertedSuppliers.length} suppliers`);

//     // Close the connection
//     await mongoose.connection.close();
//     console.log('Database connection closed');

//     process.exit(0);
//   } catch (error) {
//     console.error('Error seeding suppliers:', error);
//     process.exit(1);
//   }
// };

// // Run the seeding function
// seedSuppliers(); 