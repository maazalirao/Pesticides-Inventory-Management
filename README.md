# Pesticide Inventory Management System

A full-stack web application for managing pesticide inventory, suppliers, customers, and invoices.

## Features

- User authentication and authorization
- Product management
- Supplier management
- Customer management
- Invoice generation and tracking
- Inventory tracking
- Reports and analytics
- Responsive design

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

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation

### Installation

1. Clone the repository
```
git clone <repository-url>
cd <repository-folder>
```

2. Install dependencies
```
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=<your-secret-key>
```

Replace the placeholders with your actual MongoDB connection string and a secure JWT secret.

### Running the Application

#### Development Mode

To run both frontend and backend concurrently:
```
npm run dev:full
```

To run only the frontend:
```
npm run client
```

To run only the backend:
```
npm run server
```

#### Production Mode

1. Build the frontend
```
npm run build
```

2. Start the server
```
npm start
```

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
