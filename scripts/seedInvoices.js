import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invoice from '../server/models/Invoice.js';
import connectDB from '../server/config/db.js';
import { format } from 'date-fns';

dotenv.config();

const formatDate = (dateString) => {
  return new Date(dateString);
};

const invoices = [
  {
    invoiceNumber: "INV-2023-001",
    customer: {
      name: "Al-Barakat Farms",
      email: "info@albarakat.com",
      address: "123 Agriculture Road, Multan, Punjab"
    },
    items: [
      { description: "MaxKill Insecticide", quantity: 5, unitPrice: 4999, total: 24995 },
      { description: "HerbControl Plus", quantity: 12, unitPrice: 3850, total: 46200 },
      { description: "AntControl", quantity: 15, unitPrice: 1999, total: 29985 },
      { description: "FungoClear Solution", quantity: 3, unitPrice: 6500, total: 19500 }
    ],
    subtotal: 120680,
    tax: 4395,
    total: 125075,
    status: "Paid",
    dueDate: formatDate("2023-12-15"),
    notes: "Payment received via bank transfer",
    createdAt: formatDate("2023-11-15")
  },
  {
    invoiceNumber: "INV-2023-002",
    customer: {
      name: "City Parks Authority",
      email: "parks@cda.gov.pk",
      address: "456 Municipal Complex, Islamabad, Federal Capital"
    },
    items: [
      { description: "WeedBGone", quantity: 30, unitPrice: 2799, total: 83970 },
      { description: "MaxKill Insecticide", quantity: 40, unitPrice: 4999, total: 199960 },
      { description: "RatAway Pellets", quantity: 25, unitPrice: 2999, total: 74975 }
    ],
    subtotal: 358905,
    tax: 16320,
    total: 375225,
    status: "Paid",
    dueDate: formatDate("2023-12-20"),
    notes: "Government purchase order #PK-2023-45678",
    createdAt: formatDate("2023-11-20")
  },
  {
    invoiceNumber: "INV-2023-003",
    customer: {
      name: "Rehman Orchards",
      email: "rehman@orchards.pk",
      address: "789 Farm Road, Sialkot, Punjab"
    },
    items: [
      { description: "FungoClear Solution", quantity: 8, unitPrice: 6500, total: 52000 },
      { description: "AntControl", quantity: 10, unitPrice: 1999, total: 19990 },
      { description: "MaxKill Insecticide", quantity: 5, unitPrice: 4999, total: 24995 }
    ],
    subtotal: 96985,
    tax: 1065,
    total: 98050,
    status: "Pending",
    dueDate: formatDate("2023-12-28"),
    notes: "Net 30 payment terms",
    createdAt: formatDate("2023-11-28")
  },
  {
    invoiceNumber: "INV-2023-004",
    customer: {
      name: "Maaz Ali",
      email: "maaz.ali@gmail.com",
      address: "789 Garden Town, Lahore, Punjab"
    },
    items: [
      { description: "AntControl", quantity: 2, unitPrice: 1999, total: 3998 },
      { description: "WeedBGone", quantity: 3, unitPrice: 2799, total: 8397 }
    ],
    subtotal: 12395,
    tax: 203,
    total: 12598,
    status: "Overdue",
    dueDate: formatDate("2024-01-05"),
    notes: "Second reminder sent",
    createdAt: formatDate("2023-12-05")
  },
  {
    invoiceNumber: "INV-2023-005",
    customer: {
      name: "Agriculture University",
      email: "procurement@agri-uni.edu.pk",
      address: "University Campus, Faisalabad, Punjab"
    },
    items: [
      { description: "MaxKill Insecticide", quantity: 10, unitPrice: 4999, total: 49990 },
      { description: "FungoClear Solution", quantity: 8, unitPrice: 6500, total: 52000 },
      { description: "HerbControl Plus", quantity: 14, unitPrice: 3850, total: 53900 }
    ],
    subtotal: 155890,
    tax: 185,
    total: 156075,
    status: "Pending",
    dueDate: formatDate("2024-01-10"),
    notes: "Academic discount applied",
    createdAt: formatDate("2023-12-10")
  },
  {
    invoiceNumber: "INV-2023-006",
    customer: {
      name: "Green Pakistan Services",
      email: "orders@gps.com.pk",
      address: "45 Commercial Area, Karachi, Sindh"
    },
    items: [
      { description: "TermiteShield", quantity: 12, unitPrice: 8999, total: 107988 },
      { description: "MoldBuster", quantity: 15, unitPrice: 4550, total: 68250 },
      { description: "HerbControl Plus", quantity: 28, unitPrice: 3850, total: 107800 }
    ],
    subtotal: 284038,
    tax: 987,
    total: 285025,
    status: "Pending",
    dueDate: formatDate("2024-01-15"),
    notes: "Bulk order for commercial project",
    createdAt: formatDate("2023-12-15")
  }
];

const seedInvoices = async () => {
  try {
    // Connect to MongoDB using the existing configuration
    await connectDB();
    console.log('MongoDB Connected');

    // Clear existing invoices
    await Invoice.deleteMany({});
    console.log('Cleared existing invoices');

    // Insert new invoices
    const insertedInvoices = await Invoice.insertMany(invoices);
    console.log(`Successfully inserted ${insertedInvoices.length} invoices`);

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding invoices:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedInvoices(); 