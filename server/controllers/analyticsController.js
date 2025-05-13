import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Inventory from '../models/inventoryModel.js';
import Customer from '../models/customerModel.js';
import Supplier from '../models/supplierModel.js';
import Invoice from '../models/invoiceModel.js';
import mongoose from 'mongoose';

// Helper to get store ID from either URL params or query params
const getStoreIdFromRequest = (req) => {
  return req.params.storeId || req.query.storeId || req.body.storeId;
};

// Helper to check if user has access to the store
const checkUserStoreAccess = async (req, storeId) => {
  // Admin has access to all stores
  if (req.user.role === 'admin') return true;
  
  // For store owners and employees, check if they have access to this store
  return req.user.stores.some(store => store._id.toString() === storeId);
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/store/:storeId/dashboard-stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get store ID from request
  const storeId = getStoreIdFromRequest(req);
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required for analytics');
  }
  
  // Check if user has access to this store
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  // Build query with store filter
  const storeFilter = { store: storeId };
  
  // Get counts
  const productCount = await Product.countDocuments(storeFilter);
  const inventoryCount = await Inventory.countDocuments(storeFilter);
  const lowStockCount = await Inventory.countDocuments({ ...storeFilter, status: 'Low Stock' });
  
  // Get today's orders
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayOrdersCount = await Order.countDocuments({ 
    ...storeFilter,
    createdAt: { $gte: startOfToday } 
  });

  // Calculate this month's revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const thisMonthOrders = await Order.find({
    ...storeFilter,
    createdAt: { $gte: startOfMonth },
    isPaid: true
  });
  
  const thisMonthRevenue = thisMonthOrders.reduce(
    (total, order) => total + (order.totalPrice || 0), 
    0
  );

  // Calculate previous month's revenue for comparison
  const startOfPrevMonth = new Date(startOfMonth);
  startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);
  
  const endOfPrevMonth = new Date(startOfMonth);
  endOfPrevMonth.setDate(0);
  endOfPrevMonth.setHours(23, 59, 59, 999);
  
  const prevMonthOrders = await Order.find({
    ...storeFilter,
    createdAt: { 
      $gte: startOfPrevMonth,
      $lte: endOfPrevMonth
    },
    isPaid: true
  });
  
  const prevMonthRevenue = prevMonthOrders.reduce(
    (total, order) => total + (order.totalPrice || 0), 
    0
  );

  // Calculate percentage change
  const revenueChange = prevMonthRevenue === 0 
    ? 100 
    : ((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue * 100).toFixed(1);

  // Get yesterday's orders for comparison
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const yesterdayOrdersCount = await Order.countDocuments({
    ...storeFilter,
    createdAt: {
      $gte: startOfYesterday,
      $lt: startOfToday
    }
  });

  // Calculate percentage change in orders
  const orderChange = yesterdayOrdersCount === 0 
    ? 100 
    : ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount * 100).toFixed(1);

  // Get last week's total for low stock products
  const startOfLastWeek = new Date();
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  startOfLastWeek.setHours(0, 0, 0, 0);

  const lastWeekLowStockCount = await Inventory.countDocuments({
    ...storeFilter,
    status: 'Low Stock',
    updatedAt: { $lte: startOfLastWeek }
  });

  // Calculate percentage change in low stock
  const lowStockChange = lastWeekLowStockCount === 0 
    ? 100 
    : ((lowStockCount - lastWeekLowStockCount) / lastWeekLowStockCount * 100).toFixed(1);

  res.json({
    inventoryItems: {
      title: "Inventory Items",
      value: inventoryCount.toString(),
      description: "Total pesticide products in stock",
      icon: "Package",
      iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
      change: `+12% from last month`,
      changeType: "positive"
    },
    lowStockAlerts: {
      title: "Low Stock Alerts",
      value: lowStockCount.toString(),
      description: "Products below minimum threshold",
      icon: "AlertTriangle",
      iconClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
      change: `${lowStockChange > 0 ? '+' : ''}${lowStockChange}% since last week`,
      changeType: lowStockChange > 0 ? "negative" : "positive"
    },
    monthlyRevenue: {
      title: "Sales This Month",
      value: thisMonthRevenue.toString(),
      description: "Total revenue from sales",
      icon: "DollarSign",
      iconClass: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
      change: `${revenueChange > 0 ? '+' : ''}${revenueChange}% from last month`,
      changeType: revenueChange > 0 ? "positive" : "negative"
    },
    newOrders: {
      title: "New Orders",
      value: todayOrdersCount.toString(),
      description: "Orders received today",
      icon: "ShoppingCart",
      iconClass: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
      change: `${orderChange > 0 ? '+' : ''}${orderChange}% from yesterday`,
      changeType: orderChange > 0 ? "positive" : "negative"
    }
  });
});

/**
 * @desc    Get sales data for chart
 * @route   GET /api/analytics/store/:storeId/sales-data
 * @access  Private
 */
const getSalesData = asyncHandler(async (req, res) => {
  const { period = 'year' } = req.query;
  
  // Get store ID from request
  const storeId = getStoreIdFromRequest(req);
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required for analytics');
  }
  
  // Check if user has access to this store
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  // Determine time range based on period
  let timeFrame, format, groupBy;
  const now = new Date();
  
  switch(period) {
    case 'week':
      timeFrame = new Date(now.setDate(now.getDate() - 7));
      format = '%Y-%m-%d';
      groupBy = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
      break;
    case 'month':
      timeFrame = new Date(now.setMonth(now.getMonth() - 1));
      format = '%Y-%m-%d';
      groupBy = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
      break;
    case 'quarter':
      timeFrame = new Date(now.setMonth(now.getMonth() - 3));
      format = '%Y-%m';
      groupBy = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
      break;
    case 'year':
    default:
      timeFrame = new Date(now.setFullYear(now.getFullYear() - 1));
      format = '%Y-%m';
      groupBy = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
      break;
  }

  // Revenue data - from Orders
  const salesAggregate = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: timeFrame },
        isPaid: true,
        store: new mongoose.Types.ObjectId(storeId)
      }
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
    }
  ]);

  // Expenses data - from Invoices (for suppliers)
  const expensesAggregate = await Invoice.aggregate([
    {
      $match: {
        createdAt: { $gte: timeFrame },
        type: "purchase",
        store: new mongoose.Types.ObjectId(storeId)
      }
    },
    {
      $group: {
        _id: groupBy,
        expenses: { $sum: "$totalAmount" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
    }
  ]);

  // Prepare data structure
  let labels = [];
  let revenueData = [];
  let expensesData = [];
  let profitData = [];

  // Process based on period
  if (period === 'year' || period === 'quarter') {
    // Create a map for all months in the period
    const monthMap = new Map();
    const startMonth = timeFrame.getMonth() + 1; // 1-indexed
    const startYear = timeFrame.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (startMonth + i) % 12 || 12; // Convert 0 to 12 for December
      const year = startYear + Math.floor((startMonth + i - 1) / 12);
      const monthName = new Date(year, monthIndex - 1, 1).toLocaleString('default', { month: 'short' });
      
      monthMap.set(`${year}-${monthIndex}`, {
        label: monthName,
        revenue: 0,
        expenses: 0
      });
    }

    // Fill revenue data
    salesAggregate.forEach(item => {
      const month = item._id.month;
      const year = item._id.year;
      const key = `${year}-${month}`;
      
      if (monthMap.has(key)) {
        const entry = monthMap.get(key);
        entry.revenue = item.revenue;
      }
    });

    // Fill expenses data
    expensesAggregate.forEach(item => {
      const month = item._id.month;
      const year = item._id.year;
      const key = `${year}-${month}`;
      
      if (monthMap.has(key)) {
        const entry = monthMap.get(key);
        entry.expenses = item.expenses;
      }
    });

    // Convert map to arrays for chart
    monthMap.forEach((value) => {
      labels.push(value.label);
      revenueData.push(value.revenue);
      expensesData.push(value.expenses);
      profitData.push(value.revenue - value.expenses);
    });
  } else {
    // Daily data for week or month view
    const dayMap = new Map();
    const days = period === 'week' ? 7 : 30;
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      date.setHours(0, 0, 0, 0);
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}-${day}`;
      const label = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      
      dayMap.set(key, {
        label,
        revenue: 0,
        expenses: 0
      });
    }

    // Fill revenue data
    salesAggregate.forEach(item => {
      const day = item._id.day;
      const month = item._id.month;
      const year = item._id.year;
      const key = `${year}-${month}-${day}`;
      
      if (dayMap.has(key)) {
        const entry = dayMap.get(key);
        entry.revenue = item.revenue;
      }
    });

    // Fill expenses data
    expensesAggregate.forEach(item => {
      const day = item._id.day;
      const month = item._id.month;
      const year = item._id.year;
      const key = `${year}-${month}-${day}`;
      
      if (dayMap.has(key)) {
        const entry = dayMap.get(key);
        entry.expenses = item.expenses;
      }
    });

    // Convert map to arrays for chart
    dayMap.forEach((value) => {
      labels.push(value.label);
      revenueData.push(value.revenue);
      expensesData.push(value.expenses);
      profitData.push(value.revenue - value.expenses);
    });
  }

  res.json({
    labels,
    datasets: [
      {
        label: 'Revenue (₨)',
        data: revenueData,
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        order: 1,
      },
      {
        label: 'Expenses (₨)',
        data: expensesData,
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        fill: true,
        tension: 0.4,
        order: 2,
      },
      {
        label: 'Profit (₨)',
        data: profitData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        type: 'line',
        order: 0,
      }
    ]
  });
});

/**
 * @desc    Get inventory distribution data
 * @route   GET /api/analytics/store/:storeId/inventory-distribution
 * @access  Private
 */
const getInventoryDistribution = asyncHandler(async (req, res) => {
  // Get store ID from request
  const storeId = getStoreIdFromRequest(req);
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required for analytics');
  }
  
  // Check if user has access to this store
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  const inventoryByCategory = await Inventory.aggregate([
    {
      $match: {
        store: new mongoose.Types.ObjectId(storeId)
      }
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        totalQuantity: { $sum: "$quantity" }
      }
    },
    {
      $sort: { totalValue: -1 }
    }
  ]);

  const inventoryByStatus = await Inventory.aggregate([
    {
      $match: {
        store: new mongoose.Types.ObjectId(storeId)
      }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ["$price", "$quantity"] } }
      }
    }
  ]);

  // Format for chart.js
  const categoryLabels = inventoryByCategory.map(item => item._id || 'Other');
  const categoryValues = inventoryByCategory.map(item => item.totalQuantity);
  const categoryColors = [
    'rgba(34, 197, 94, 0.7)',   // green
    'rgba(59, 130, 246, 0.7)',  // blue
    'rgba(168, 85, 247, 0.7)',  // purple
    'rgba(249, 115, 22, 0.7)',  // orange
    'rgba(239, 68, 68, 0.7)',   // red
    'rgba(156, 163, 175, 0.7)', // gray
  ];

  const statusLabels = inventoryByStatus.map(item => item._id || 'Other');
  const statusValues = inventoryByStatus.map(item => item.count);

  res.json({
    byCategory: inventoryByCategory.map(item => ({
      category: item._id,
      count: item.count,
      totalValue: item.totalValue,
      totalQuantity: item.totalQuantity
    })),
    byStatus: inventoryByStatus.map(item => ({
      status: item._id,
      count: item.count,
      totalValue: item.totalValue
    })),
    // Chart.js ready format
    labels: categoryLabels,
    datasets: [{
      label: 'Inventory by Category',
      data: categoryValues,
      backgroundColor: categoryColors.slice(0, categoryLabels.length),
      borderColor: categoryColors.slice(0, categoryLabels.length).map(color => color.replace('0.7', '1')),
      borderWidth: 1
    }]
  });
});

/**
 * @desc    Get customer segment data
 * @route   GET /api/analytics/store/:storeId/customer-segments
 * @access  Private
 */
const getCustomerSegments = asyncHandler(async (req, res) => {
  // Get store ID from request
  const storeId = getStoreIdFromRequest(req);
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required for analytics');
  }
  
  // Check if user has access to this store
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  // Customer type distribution
  const customerTypes = await Customer.aggregate([
    {
      $match: {
        store: new mongoose.Types.ObjectId(storeId)
      }
    },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);

  // Get orders by customer
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const customerOrders = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        store: new mongoose.Types.ObjectId(storeId)
      }
    },
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalPrice" }
      }
    },
    {
      $sort: { totalSpent: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    {
      $unwind: "$userDetails"
    },
    {
      $project: {
        _id: 1,
        orderCount: 1,
        totalSpent: 1,
        name: "$userDetails.name",
        email: "$userDetails.email"
      }
    }
  ]);

  // Format for chart.js
  const typeLabels = customerTypes.map(type => type._id || 'Unspecified');
  const typeCounts = customerTypes.map(type => type.count);
  const typeColors = [
    'rgba(59, 130, 246, 0.7)',  // blue
    'rgba(168, 85, 247, 0.7)',  // purple
    'rgba(34, 197, 94, 0.7)',   // green
    'rgba(249, 115, 22, 0.7)',  // orange
  ];

  res.json({
    customerTypes: customerTypes.map(type => ({
      type: type._id || 'Unspecified',
      count: type.count
    })),
    topCustomers: customerOrders,
    // Chart.js ready format
    labels: typeLabels,
    datasets: [{
      label: 'Customer Types',
      data: typeCounts,
      backgroundColor: typeColors.slice(0, typeLabels.length),
      borderColor: typeColors.slice(0, typeLabels.length).map(color => color.replace('0.7', '1')),
      borderWidth: 1
    }]
  });
});

/**
 * @desc    Get sales forecast data
 * @route   GET /api/analytics/store/:storeId/sales-forecast
 * @access  Private
 */
const getSalesForecast = asyncHandler(async (req, res) => {
  // Get store ID from request
  const storeId = getStoreIdFromRequest(req);
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required for analytics');
  }
  
  // Check if user has access to this store
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  // Get historical sales data for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const historicalSales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: twelveMonthsAgo },
        isPaid: true,
        store: new mongoose.Types.ObjectId(storeId)
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }
    }
  ]);
  
  // Simplified forecast model (just for demonstration)
  // In a real app, this would be a more complex ML model
  const forecast = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentYear = now.getFullYear();
  
  // Simple moving average forecast for next 3 months
  if (historicalSales.length > 0) {
    const lastThreeMonths = historicalSales.slice(-3);
    const avgRevenue = lastThreeMonths.reduce((sum, month) => sum + month.revenue, 0) / lastThreeMonths.length;
    const avgCount = lastThreeMonths.reduce((sum, month) => sum + month.count, 0) / lastThreeMonths.length;
    
    // Project for next 3 months with a small growth factor
    for (let i = 1; i <= 3; i++) {
      let forecastMonth = currentMonth + i;
      let forecastYear = currentYear;
      
      if (forecastMonth > 12) {
        forecastMonth -= 12;
        forecastYear += 1;
      }
      
      forecast.push({
        _id: {
          year: forecastYear,
          month: forecastMonth
        },
        revenue: avgRevenue * (1 + (i * 0.05)), // 5% growth per month
        count: Math.round(avgCount * (1 + (i * 0.03))), // 3% growth per month
        isForecast: true
      });
    }
  }

  // Format the data
  const formatData = (data) => {
    return data.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      revenue: Math.round(item.revenue * 100) / 100,
      count: item.count,
      isForecast: item.isForecast || false
    }));
  };
  
  const formattedHistorical = formatData(historicalSales);
  const formattedForecast = formatData(forecast);
  
  // Format for Chart.js
  const allData = [...formattedHistorical, ...formattedForecast];
  const labels = allData.map(item => {
    const date = new Date(item.date + '-01'); // Add day for proper date parsing
    return date.toLocaleDateString('default', { month: 'short', year: '2-digit' });
  });
  
  const revenueData = allData.map(item => item.revenue);
  const orderCountData = allData.map(item => item.count);
  
  res.json({
    historical: formattedHistorical,
    forecast: formattedForecast,
    // Chart.js format
    labels: labels,
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Order Count',
        data: orderCountData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  });
});

// Format date for consistent output
const formatDate = (date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

/**
 * @desc    Get low stock products
 * @route   GET /api/analytics/store/:storeId/low-stock
 * @access  Private
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  // Get store ID from request
  const storeId = getStoreIdFromRequest(req);
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required for analytics');
  }
  
  // Check if user has access to this store
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  // Use aggregation to compare quantity with threshold for each item
  const lowStockProducts = await Inventory.aggregate([
    { $match: { store: new mongoose.Types.ObjectId(storeId) } },
    { $match: { $expr: { $lte: ["$quantity", "$threshold"] } } },
    { $sort: { quantity: 1 } },
    { $limit: 10 },
    { $project: { 
        name: 1, 
        sku: 1, 
        quantity: 1, 
        threshold: 1, 
        category: 1, 
        status: 1,
        price: 1 
    }}
  ]);
  
  res.json(lowStockProducts);
});

/**
 * @desc    Get expiring products
 * @route   GET /api/analytics/store/:storeId/expiring-products
 * @access  Private
 */
const getExpiringProducts = asyncHandler(async (req, res) => {
  // Get store ID from request
  const storeId = getStoreIdFromRequest(req);
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required for analytics');
  }
  
  // Check if user has access to this store
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  const nextThreeMonths = new Date();
  nextThreeMonths.setMonth(nextThreeMonths.getMonth() + 3);
  
  // Find inventory items with expiring batches
  const inventoryWithExpiringBatches = await Inventory.find({
    store: storeId,
    'batches.expiryDate': { $lte: nextThreeMonths, $gte: new Date() }
  })
  .select('name sku batches store');
  
  // Format the response
  const expiringProducts = inventoryWithExpiringBatches.map(item => {
    const expiringBatches = item.batches.filter(batch => 
      batch.expiryDate <= nextThreeMonths && batch.expiryDate >= new Date()
    ).sort((a, b) => a.expiryDate - b.expiryDate);
    
    return {
      _id: item._id,
    name: item.name,
      sku: item.sku,
      store: item.store,
      expiringBatches: expiringBatches.map(batch => ({
        batchId: batch.batchId,
        lotNumber: batch.lotNumber,
        quantity: batch.quantity,
        expiryDate: formatDate(batch.expiryDate),
        daysUntilExpiry: Math.round((batch.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
      }))
    };
  });
  
  res.json(expiringProducts);
});

/**
 * @desc    Get recent sales
 * @route   GET /api/analytics/store/:storeId/recent-sales
 * @access  Private
 */
const getRecentSales = asyncHandler(async (req, res) => {
  // Get store ID from request
  const storeId = getStoreIdFromRequest(req);
  
  if (!storeId) {
    res.status(400);
    throw new Error('Store ID is required for analytics');
  }
  
  // Check if user has access to this store
  const hasAccess = await checkUserStoreAccess(req, storeId);
  if (!hasAccess) {
    res.status(403);
    throw new Error('You do not have access to this store');
  }
  
  // Get recent orders/sales (last 7 days)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const recentOrders = await Order.find({
    store: storeId,
    createdAt: { $gte: lastWeek },
    isPaid: true
  })
  .sort({ createdAt: -1 })
  .limit(5)
  .populate('user', 'name email');
  
  // Format the response
  const recentSales = recentOrders.map(order => {
    // Get the first order item as the main product (simplified)
    const mainProduct = order.orderItems && order.orderItems.length > 0 
      ? order.orderItems[0].name 
      : 'Unknown Product';
    
    // Calculate total quantity
    const quantity = order.orderItems
      ? order.orderItems.reduce((total, item) => total + item.quantity, 0)
      : 0;
    
    return {
      id: order._id,
      customer: order.user ? order.user.name : 'Guest Customer',
      product: mainProduct,
      quantity: quantity,
      total: order.totalPrice,
      date: formatDate(order.createdAt)
    };
  });
  
  res.json(recentSales);
});

export {
  getDashboardStats,
  getSalesData,
  getInventoryDistribution,
  getCustomerSegments,
  getSalesForecast,
  getLowStockProducts,
  getExpiringProducts,
  getRecentSales
}; 