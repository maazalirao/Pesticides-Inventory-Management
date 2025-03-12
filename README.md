# PestTrack - Pesticide Inventory Management System

PestTrack is a modern web application for managing pesticide inventory, products, suppliers, customers, and more. It's built with React.js, Tailwind CSS, and features a clean, professional user interface.

## Features

- **Dashboard**: Overview of key metrics, charts, and alerts
- **Inventory Management**: Track stock levels, expiry dates, and receive alerts
- **Product Management**: Organize and categorize pesticide products
- **Supplier Management**: Keep track of supplier information and product categories
- **Customer Management**: Manage customer profiles and purchase history
- **Invoice & Billing**: (Coming soon) Generate purchase invoices and track bills
- **Reporting & Analytics**: (Coming soon) View detailed reports on sales and inventory
- **Online Store Features**: (Coming soon) Sell products online with integrated order management

## Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd pesttrack
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── assets/         # Static assets like images
├── components/     # Reusable UI components
│   └── ui/         # Base UI components
├── layouts/        # Layout components
├── lib/            # Utility functions
├── pages/          # Page components
└── main.jsx        # Application entry point
```

## Development Roadmap

- [x] Dashboard
- [x] Inventory Management
- [x] Product Management
- [x] Supplier Management
- [x] Customer Management
- [ ] Invoice & Billing
- [ ] Reporting & Analytics
- [ ] Online Store Features
- [ ] Backend Integration

## Backend Integration

This project currently includes only the frontend implementation. To make it fully functional, you'll need to:

1. Develop a backend API (using Node.js, Django, Laravel, etc.)
2. Set up a database (PostgreSQL, MySQL, MongoDB, etc.)
3. Connect the frontend to the backend using API calls

## License

[MIT License](LICENSE)

## Contact

For any questions or feedback, please open an issue in the repository.
