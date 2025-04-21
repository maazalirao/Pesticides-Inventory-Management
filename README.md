# AgriStore - Inventory Management & E-commerce Platform

## Overview

AgriStore is a comprehensive solution for agricultural product businesses, combining:
1. **E-commerce Storefront**: Customer-facing online store 
2. **Inventory Management**: Robust back-office system
3. **Admin Dashboard**: Complete business management

## Features

### Customer-Facing Storefront
- Product browsing and searching
- Category navigation
- Shopping cart functionality
- User accounts and order history
- Secure checkout process
- Responsive design for all devices

### Admin Dashboard
- **Inventory Management**: Track stock levels and product locations
- **Order Processing**: Manage customer orders from receipt to fulfillment
- **Customer Management**: Store customer information and purchase history
- **Supplier Management**: Track supplier information and purchase orders
- **Reporting**: Sales analytics, inventory forecasting, and business insights
- **User Management**: Role-based access control (Admin, Staff, Customer)

## Architecture

The application uses a modern, scalable architecture:

- **Frontend**: React with TailwindCSS
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: Clerk for secure user management
- **State Management**: React Context API
- **Routing**: React Router v7

## Role-Based Access

The system implements role-based access control:
- **Customers**: Access to the storefront, their orders, and account
- **Staff**: Access to order management and basic admin functions
- **Admins**: Full access to all system features

## Data Flow

Orders placed in the storefront automatically:
1. Update inventory levels
2. Create order records
3. Generate notifications for staff
4. Update sales analytics

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Seed the database: `npm run seed:all`
5. Start development server: `npm run dev:full`

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Update the values in `.env` with your actual configuration
3. For production deployment, configure environment variables in your hosting platform (Vercel, etc.)

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Chart.js
- Axios

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication

## API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users` - Register a new user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product (admin only)
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete a product (admin only)

## License

This project is licensed under the MIT License.
