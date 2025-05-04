# FYP-Web-Pes Project Flow

This document provides a comprehensive overview of the FYP-Web-Pes project, detailing the flow between different components, user roles, and functionality.

## Project Overview

FYP-Web-Pes is a full-stack e-commerce platform specializing in agricultural products. It consists of two main interfaces:

1. **Store Frontend**: For customers to browse products, make purchases, and manage their orders
2. **Admin Dashboard**: For administrators to manage products, inventory, orders, customers, and analyze business performance

The application is built using:
- **Frontend**: React.js with TailwindCSS for styling
- **Backend**: Node.js with Express
- **Database**: MongoDB (via Mongoose ODM)

## User Roles

The system has three primary user roles:

1. **Customer**: Can browse products, add items to cart, place orders, and view order history
2. **Staff**: Can manage orders, inventory, and provide customer support
3. **Admin**: Has full access to all system features, including reports, analytics, and user management

## Complete Project Flow

### 1. Store Frontend Flow

#### 1.1 Browse & Shop
1. User visits the landing page
2. User browses products via category navigation or search
3. User can filter and sort products based on various criteria
4. User views detailed product information including descriptions, pricing, and availability

#### 1.2 Cart & Checkout
1. User adds products to their shopping cart
2. User reviews cart contents, adjusts quantities, or removes items
3. User proceeds to checkout
4. User enters shipping information and selects payment method
5. User confirms and places the order
6. Order confirmation page is displayed with order reference number

#### 1.3 User Account & Order Management
1. User can register for an account or login to existing account
2. User can view and update their profile information
3. User can view their order history
4. User can click on a specific order to view detailed information including:
   - Order status
   - List of ordered items
   - Shipping information
   - Payment details
   - Order timeline showing the progression of the order

### 2. Admin Dashboard Flow

#### 2.1 Dashboard & Analytics
1. Admin logs in to the admin dashboard
2. Admin views key metrics and performance indicators:
   - Total sales
   - New orders
   - Inventory alerts
   - Customer statistics
3. Admin can view graphical representations of sales trends and other analytics

#### 2.2 Order Management
1. Admin can view all orders with filtering options
2. Admin can click on specific orders to view details
3. Admin can update order status (processing, shipped, delivered, etc.)
4. Admin can add tracking information or notes to orders
5. Admin can generate invoices for orders

#### 2.3 Product & Inventory Management
1. Admin can view, add, edit, and delete products
2. Admin can manage product categories and tags
3. Admin can update inventory levels and set low stock alerts
4. Admin can manage product pricing, discounts, and promotions

#### 2.4 Customer Management
1. Admin can view and search customer accounts
2. Admin can view customer order history
3. Admin can manage customer information and account status

#### 2.5 Supplier Management
1. Admin can add and manage supplier information
2. Admin can track orders placed with suppliers
3. Admin can manage product-supplier relationships

#### 2.6 Reports & Analytics
1. Admin can generate various reports:
   - Sales reports by period
   - Product performance reports
   - Inventory status reports
   - Customer activity reports
2. Admin can export reports in various formats

### 3. Data Flow Between Components

#### 3.1 Order Processing Flow
1. Customer places an order in the store frontend
2. Order data is saved to the database
3. Order appears in the admin dashboard for processing
4. Admin updates order status as it progresses
5. Customer can view updated order status in their order history
6. Email notifications are sent to the customer at various stages

#### 3.2 Inventory Management Flow
1. Admin updates inventory levels in the admin dashboard
2. Product availability is automatically updated in the store frontend
3. Low stock alerts are generated when inventory reaches threshold levels
4. Out-of-stock products are marked accordingly in the store

#### 3.3 User Authentication Flow
1. User credentials are verified against the database
2. JWT tokens are issued for authenticated sessions
3. Role-based access control determines available features and actions
4. Session management handles token refresh and logout

## Technical Architecture

### Frontend Structure
- **Pages**: Main views of the application (e.g., Home, ProductList, OrderDetail)
- **Components**: Reusable UI elements
- **Contexts**: State management for cart, auth, etc.
- **Layouts**: Page layout templates
- **Lib**: Utility functions and helpers

### Backend Structure
- **Routes**: API endpoints organized by resource
- **Controllers**: Business logic for handling requests
- **Models**: Database schema definitions
- **Middleware**: Authentication, validation, error handling

### API Endpoints
- **/api/products**: Product-related operations
- **/api/orders**: Order management endpoints
- **/api/users**: User account management
- **/api/auth**: Authentication endpoints
- **/api/categories**: Product category management
- **/api/suppliers**: Supplier management

## Deployment Architecture

The application is deployed using:
- Frontend hosted on Vercel
- Backend API on a separate server
- MongoDB Atlas for database hosting
- AWS S3 for product image storage

## Future Enhancements

Planned future enhancements include:
- Integration with additional payment gateways
- Mobile application development
- Advanced analytics and reporting features
- Customer loyalty program
- Internationalization support
- Product recommendation system 