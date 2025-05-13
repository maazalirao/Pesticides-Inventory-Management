# Multi-Tenant Pesticide Management System

This document explains the implementation of multi-tenancy in the Pesticide Management System, where each store owner can access and manage their assigned store(s) only.

## Approach Implemented

We've taken a "single database with tenant-based data partitioning" approach, where:

1. All data is stored in one MongoDB database
2. Each document that belongs to a store includes a `store` reference field
3. Access control happens at the API level through middleware and consistent store filtering

## Implemented Components

### 1. Database Models

- **User Model**: Updated with roles (`admin`, `store_owner`, `employee`) and `stores` field that contains references to stores the user can access
- **Store Model**: New model for storing store information and ownership
- **Product/Inventory/Customer Models**: Updated with `store` field for multi-tenancy and proper indexing

### 2. Authentication & Authorization

- **JWT Authentication**: Uses token-based authentication
- **Role-Based Access**: Different roles have different access levels:
  - `admin`: Can manage all stores and see all data
  - `store_owner`: Can manage only their assigned store(s)
  - `employee`: Can only work on assigned store(s) with limited permissions
- **Store Access Validation**: The `checkStoreAccess` middleware enforces proper store access in all environments (including development)

### 3. API Routes

- **Store-Specific Routes**: Format `/api/resource/store/:storeId/...` 
- **Admin Routes**: Format `/api/resource/admin/...` for global access
- **User Store Management**: Admin can assign/remove stores from users

### 4. Authentication Middleware

- `protect`: Verifies JWT token and loads user data
- `admin`: Restricts access to admin users only
- `storeOwner`: Allows access to admin and store owners
- `checkStoreAccess`: Verifies user has access to the requested store and ensures proper store filtering in all API requests

### 5. Frontend Store Selection

- **StoreSelectionContext**: Manages the current store selection and provides it to all components
- **Axios Interceptors**: Automatically adds the store ID to all API requests
- **Store Selector**: UI component that allows users with multiple stores to switch between them
- **Per-Store Caching**: Maintains separate data caches for each store to avoid data leakage

## Security Enhancements

### 1. Fixed Data Isolation Issues

- **Analytics Controller**: Now properly filters all analytics data by store ID
- **Middleware Enforcement**: Modified to enforce store filtering even in development mode
- **Standardized Controller Patterns**: All controllers (inventory, customers, suppliers, etc.) now follow consistent patterns for store filtering
- **Automatic Store ID Inclusion**: Frontend Axios interceptors ensure all API requests include store IDs
- **MongoDB Indexing**: Fixed composite indices on store and batch IDs to prevent duplication issues
- **Batch ID Validation**: Added validation to prevent null batch IDs that could cause cross-store data exposure

### 2. Consistent Store Data Filtering

Every controller now implements these security practices:
- Extract store ID from request (params, query, or body)
- Validate user's access to the requested store
- Apply store ID filtering to all database queries
- Validate ownership before performing updates or deletions

## Usage Examples

### Accessing Store-Specific Data

```javascript
// Frontend API call (store ID automatically added by interceptor)
const getProducts = async () => {
  const response = await axios.get('/api/products/store/:storeId');
  return response.data;
};

// Backend controller (with built-in store access check)
const getProducts = asyncHandler(async (req, res) => {
  const storeId = getStoreIdFromRequest(req);
  
  // Validate store access
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  // Always filter by store
  const products = await Product.find({ store: storeId });
  res.json(products);
});
```

### Admin Global Access

```javascript
// Admin can see all products across all stores
const getAllProducts = asyncHandler(async (req, res) => {
  // Admin role is verified by middleware before this runs
  // No store filter for admin global view
  const products = await Product.find({}).populate('store', 'name');
  res.json(products);
});
```

## Data Isolation Testing

To verify proper data isolation:

1. Create multiple stores in the system
2. Add different products/inventory/customers to each store
3. Log in as different store owners and verify they can only see their own data
4. Attempt to access data from other stores via direct API calls (should be blocked)
5. Verify analytics and reports only show data from the current store 