// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import Customer from '../server/models/customerModel.js';
// import connectDB from '../server/config/db.js';

// dotenv.config();

// const customers = [
//   {
//     name: "Al-Barakat Farms",
//     email: "info@albarakat.com",
//     phone: "+92 (301) 123-4567",
//     address: {
//       street: "123 Agriculture Road",
//       city: "Multan",
//       state: "Punjab",
//       zipCode: "60000",
//       country: "Pakistan"
//     },
//     paymentMethod: "Bank Transfer",
//     taxId: "NTN-8901234",
//     notes: "Large agricultural farm, monthly buyer",
//     isActive: true
//   },
//   {
//     name: "City Parks Authority",
//     email: "parks@cda.gov.pk",
//     phone: "+92 (333) 987-6543",
//     address: {
//       street: "456 Municipal Complex",
//       city: "Islamabad",
//       state: "Federal Capital",
//       zipCode: "44000",
//       country: "Pakistan"
//     },
//     paymentMethod: "Government Voucher",
//     taxId: "NTN-9012345",
//     notes: "Government entity, requires official receipts",
//     isActive: true
//   },
//   {
//     name: "Maaz Ali",
//     email: "maaz.ali@gmail.com",
//     phone: "+92 (321) 234-5678",
//     address: {
//       street: "789 Garden Town",
//       city: "Lahore",
//       state: "Punjab",
//       zipCode: "54000",
//       country: "Pakistan"
//     },
//     paymentMethod: "Cash",
//     taxId: "",
//     notes: "Small garden owner, buys in small quantities",
//     isActive: true
//   },
//   {
//     name: "Rehman Orchards",
//     email: "contact@rehmanorchards.pk",
//     phone: "+92 (300) 111-2233",
//     address: {
//       street: "101 Fruit Market Road",
//       city: "Swat",
//       state: "KPK",
//       zipCode: "19200",
//       country: "Pakistan"
//     },
//     paymentMethod: "Cheque",
//     taxId: "NTN-0123456",
//     notes: "Large orchard, seasonal buyer",
//     isActive: true
//   },
//   {
//     name: "Green Pakistan Services",
//     email: "info@greenpak.com",
//     phone: "+92 (313) 444-5566",
//     address: {
//       street: "202 Commercial Area",
//       city: "Karachi",
//       state: "Sindh",
//       zipCode: "74000",
//       country: "Pakistan"
//     },
//     paymentMethod: "Credit Card",
//     taxId: "NTN-1234567",
//     notes: "Landscaping company, bulk orders",
//     isActive: true
//   },
//   {
//     name: "Agriculture University",
//     email: "purchase@agri.edu.pk",
//     phone: "+92 (345) 777-8899",
//     address: {
//       street: "303 University Road",
//       city: "Faisalabad",
//       state: "Punjab",
//       zipCode: "38000",
//       country: "Pakistan"
//     },
//     paymentMethod: "Bank Transfer",
//     taxId: "NTN-2345678",
//     notes: "Educational institution, research purposes",
//     isActive: true
//   },
//   {
//     name: "Umar Farooq",
//     email: "umar.farooq@gmail.com",
//     phone: "+92 (332) 876-5432",
//     address: {
//       street: "404 Model Town",
//       city: "Sialkot",
//       state: "Punjab",
//       zipCode: "51310",
//       country: "Pakistan"
//     },
//     paymentMethod: "Cash",
//     taxId: "",
//     notes: "Home garden enthusiast",
//     isActive: false
//   },
//   {
//     name: "Al-Madina Nursery",
//     email: "sales@almadinanursery.pk",
//     phone: "+92 (311) 222-3344",
//     address: {
//       street: "505 Nursery Road",
//       city: "Rawalpindi",
//       state: "Punjab",
//       zipCode: "46000",
//       country: "Pakistan"
//     },
//     paymentMethod: "Bank Transfer",
//     taxId: "NTN-3456789",
//     notes: "Retail nursery, regular customer",
//     isActive: true
//   },
//   {
//     name: "Punjab Agro Industries",
//     email: "info@punjabagro.com",
//     phone: "+92 (303) 555-7788",
//     address: {
//       street: "606 Industrial Estate",
//       city: "Gujranwala",
//       state: "Punjab",
//       zipCode: "52250",
//       country: "Pakistan"
//     },
//     paymentMethod: "Cheque",
//     taxId: "NTN-4567890",
//     notes: "Large farming corporation, bulk orders",
//     isActive: true
//   },
//   {
//     name: "Peshawar Parks Department",
//     email: "parks@peshawar.gov.pk",
//     phone: "+92 (342) 999-0011",
//     address: {
//       street: "707 Municipal Office",
//       city: "Peshawar",
//       state: "KPK",
//       zipCode: "25000",
//       country: "Pakistan"
//     },
//     paymentMethod: "Government Voucher",
//     taxId: "NTN-5678901",
//     notes: "Municipal department, require pest control for public parks",
//     isActive: true
//   }
// ];

// const seedCustomers = async () => {
//   try {
//     // Connect to MongoDB using the existing configuration
//     await connectDB();
//     console.log('MongoDB Connected');

//     // Clear existing customers
//     await Customer.deleteMany({});
//     console.log('Cleared existing customers');

//     // Insert new customers
//     const insertedCustomers = await Customer.insertMany(customers);
//     console.log(`Successfully inserted ${insertedCustomers.length} customers`);

//     // Close the connection
//     await mongoose.connection.close();
//     console.log('Database connection closed');

//     process.exit(0);
//   } catch (error) {
//     console.error('Error seeding customers:', error);
//     process.exit(1);
//   }
// };

// // Run the seeding function
// seedCustomers(); 