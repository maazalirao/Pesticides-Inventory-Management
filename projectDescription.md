# PestShield Web Application - Project Description

## Project Overview
PestShield is a multi-tenant web application designed for the management of pesticide and agricultural product inventory across multiple stores. The application provides a comprehensive solution for store owners to manage their products, inventory, suppliers, and customers while maintaining complete data isolation between different stores.

## Current State of the Project

### Multi-Tenant Architecture
- Successfully implemented a robust multi-tenant architecture where each store has its own isolated data
- Store owners can only access and manage data related to their specific store
- The system supports multiple stores (currently configured for Maaz, Ali, and Rao)

### Data Models
The application currently includes the following core data models:
- **Stores**: Basic store information including name, description, contact details, and address
- **Products**: Detailed product information including name, description, category, price (in PKR), stock levels, etc.
- **Inventory**: Comprehensive inventory tracking with batches, quantities, and stock status
- **Suppliers**: Supplier management with contact information and store-specific relationships
- **Customers**: Customer management with contact information and store-specific relationships

### Features Implemented

#### Store Management
- Store creation and management
- Store-specific dashboard with analytics

#### Product Management
- Add, edit, and delete products
- Product categorization
- Stock level tracking with threshold alerts
- Out-of-stock indicators
- Price management in PKR currency

#### Inventory Management
- Batch tracking
- Stock level monitoring
- Low stock alerts
- Inventory status tracking (In Stock, Low Stock, Out of Stock)

#### Supplier Management
- Add, edit, and delete suppliers
- Store-specific supplier relationships
- Supplier contact information management

#### Customer Management
- Add, edit, and delete customers
- Store-specific customer relationships
- Customer contact information management

### Database Seeding
- Implemented scripts to populate the database with test data
- Each store has 5 suppliers, 5 products, 5 inventory items, and 5 customers
- Data is properly isolated between stores

### User Interface
- Modern, responsive design using Tailwind CSS
- Dark mode support
- Interactive components using React
- Intuitive navigation and user experience
- Status indicators for inventory levels

### Recent Updates
1. Updated all pricing to display in PKR (Pakistani Rupees) instead of USD
2. Enhanced visibility of "Out of stock" messages with black text for better readability
3. Added proper data isolation between stores
4. Implemented comprehensive database seeding scripts

## Technical Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI components
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT-based authentication

## Future Enhancements
1. Order management system
2. Advanced analytics and reporting
3. User role management (admin, manager, staff)
4. Mobile application
5. Integration with payment gateways
6. Barcode scanning for inventory management
7. Export/import functionality for data
8. Email notifications for low stock and other alerts

## Deployment
The application is currently set up for deployment on Vercel, with configuration files in place.

## Project Structure
The project follows a standard React application structure with separate directories for components, pages, contexts, and utilities. The server-side code is organized into controllers, models, routes, and middleware.

## Getting Started
To run the application locally:
1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables
4. Run the development server with `npm run dev`
5. Seed the database with `node scripts/seedAll.js`

## Conclusion
The PestShield web application is a comprehensive solution for pesticide and agricultural product inventory management across multiple stores. With its multi-tenant architecture and robust feature set, it provides store owners with the tools they need to efficiently manage their inventory, suppliers, and customers. 