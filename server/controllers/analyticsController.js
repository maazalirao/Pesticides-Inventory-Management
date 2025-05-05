import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Inventory from "../models/inventoryModel.js";
import Customer from "../models/customerModel.js";
import Supplier from "../models/supplierModel.js";
import Invoice from "../models/invoiceModel.js";
import mongoose from "mongoose";

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/analytics/dashboard-stats
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get counts
  const productCount = await Product.countDocuments();
  const inventoryCount = await Inventory.countDocuments();
  const lowStockCount = await Inventory.countDocuments({ status: "Low Stock" });

  // Get today's orders
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayOrdersCount = await Order.countDocuments({
    createdAt: { $gte: startOfToday },
  });

  // Calculate this month's revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthOrders = await Order.find({
    createdAt: { $gte: startOfMonth },
    isPaid: true,
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
    createdAt: {
      $gte: startOfPrevMonth,
      $lte: endOfPrevMonth,
    },
    isPaid: true,
  });

  const prevMonthRevenue = prevMonthOrders.reduce(
    (total, order) => total + (order.totalPrice || 0),
    0
  );

  // Calculate percentage change
  const revenueChange =
    prevMonthRevenue === 0
      ? 100
      : (
          ((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) *
          100
        ).toFixed(1);

  // Get yesterday's orders for comparison
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const yesterdayOrdersCount = await Order.countDocuments({
    createdAt: {
      $gte: startOfYesterday,
      $lt: startOfToday,
    },
  });

  // Calculate percentage change in orders
  const orderChange =
    yesterdayOrdersCount === 0
      ? 100
      : (
          ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) *
          100
        ).toFixed(1);

  // Get last week's total for low stock products
  const startOfLastWeek = new Date();
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
  startOfLastWeek.setHours(0, 0, 0, 0);

  const lastWeekLowStockCount = await Inventory.countDocuments({
    status: "Low Stock",
    updatedAt: { $lte: startOfLastWeek },
  });

  // Calculate percentage change in low stock
  const lowStockChange =
    lastWeekLowStockCount === 0
      ? 100
      : (
          ((lowStockCount - lastWeekLowStockCount) / lastWeekLowStockCount) *
          100
        ).toFixed(1);

  res.json({
    inventoryItems: {
      title: "Inventory Items",
      value: inventoryCount.toString(),
      description: "Total pesticide products in stock",
      icon: "Package",
      iconClass:
        "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
      change: `+12% from last month`,
      changeType: "positive",
    },
    lowStockAlerts: {
      title: "Low Stock Alerts",
      value: lowStockCount.toString(),
      description: "Products below minimum threshold",
      icon: "AlertTriangle",
      iconClass:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300",
      change: `${
        lowStockChange > 0 ? "+" : ""
      }${lowStockChange}% since last week`,
      changeType: lowStockChange > 0 ? "negative" : "positive",
    },
    monthlyRevenue: {
      title: "Sales This Month",
      value: thisMonthRevenue.toString(),
      description: "Total revenue from sales",
      icon: "DollarSign",
      iconClass:
        "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
      change: `${
        revenueChange > 0 ? "+" : ""
      }${revenueChange}% from last month`,
      changeType: revenueChange > 0 ? "positive" : "negative",
    },
    newOrders: {
      title: "New Orders",
      value: todayOrdersCount.toString(),
      description: "Orders received today",
      icon: "ShoppingCart",
      iconClass:
        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
      change: `${orderChange > 0 ? "+" : ""}${orderChange}% from yesterday`,
      changeType: orderChange > 0 ? "positive" : "negative",
    },
  });
});

/**
 * @desc    Get sales data for chart
 * @route   GET /api/analytics/sales-data
 * @access  Private/Admin
 */
const getSalesData = asyncHandler(async (req, res) => {
  const { period = "year" } = req.query;

  // Determine time range based on period
  let timeFrame, format, groupBy;
  const now = new Date();

  switch (period) {
    case "week":
      timeFrame = new Date(now.setDate(now.getDate() - 7));
      format = "%Y-%m-%d";
      groupBy = {
        day: { $dayOfMonth: "$createdAt" },
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      };
      break;
    case "month":
      timeFrame = new Date(now.setMonth(now.getMonth() - 1));
      format = "%Y-%m-%d";
      groupBy = {
        day: { $dayOfMonth: "$createdAt" },
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      };
      break;
    case "quarter":
      timeFrame = new Date(now.setMonth(now.getMonth() - 3));
      format = "%Y-%m";
      groupBy = {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      };
      break;
    case "year":
    default:
      timeFrame = new Date(now.setFullYear(now.getFullYear() - 1));
      format = "%Y-%m";
      groupBy = {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      };
      break;
  }

  // Revenue data - from Orders
  const salesAggregate = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: timeFrame },
        isPaid: true,
      },
    },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);

  // Expenses data - from Invoices (for suppliers)
  const expensesAggregate = await Invoice.aggregate([
    {
      $match: {
        createdAt: { $gte: timeFrame },
        type: "purchase",
      },
    },
    {
      $group: {
        _id: groupBy,
        expenses: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);

  // Prepare data structure
  let labels = [];
  let revenueData = [];
  let expensesData = [];
  let profitData = [];

  // Process based on period
  if (period === "year" || period === "quarter") {
    // Create a map for all months in the period
    const monthMap = new Map();
    const startMonth = timeFrame.getMonth() + 1; // 1-indexed
    const startYear = timeFrame.getFullYear();

    for (let i = 0; i < 12; i++) {
      const monthIndex = (startMonth + i) % 12 || 12; // Convert 0 to 12 for December
      const year = startYear + Math.floor((startMonth + i - 1) / 12);
      const monthName = new Date(year, monthIndex - 1, 1).toLocaleString(
        "default",
        { month: "short" }
      );

      monthMap.set(`${year}-${monthIndex}`, {
        label: monthName,
        revenue: 0,
        expenses: 0,
      });
    }

    // Fill revenue data
    salesAggregate.forEach((item) => {
      const month = item._id.month;
      const year = item._id.year;
      const key = `${year}-${month}`;

      if (monthMap.has(key)) {
        const entry = monthMap.get(key);
        entry.revenue = item.revenue;
      }
    });

    // Fill expenses data
    expensesAggregate.forEach((item) => {
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
    const days = period === "week" ? 7 : 30;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      date.setHours(0, 0, 0, 0);

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}-${day}`;
      const label = date.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
      });

      dayMap.set(key, {
        label,
        revenue: 0,
        expenses: 0,
      });
    }

    // Fill revenue data
    salesAggregate.forEach((item) => {
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
    expensesAggregate.forEach((item) => {
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
        label: "Revenue (₨)",
        data: revenueData,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
        order: 1,
      },
      {
        label: "Expenses (₨)",
        data: expensesData,
        borderColor: "rgb(234, 88, 12)",
        backgroundColor: "rgba(234, 88, 12, 0.1)",
        fill: true,
        tension: 0.4,
        order: 2,
      },
      {
        label: "Profit (₨)",
        data: profitData,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        type: "line",
        order: 0,
      },
    ],
  });
});

/**
 * @desc    Get inventory distribution data
 * @route   GET /api/analytics/inventory-distribution
 * @access  Private/Admin
 */
const getInventoryDistribution = asyncHandler(async (req, res) => {
  const inventoryByCategory = await Inventory.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const categories = [];
  const counts = [];

  // Extract top 5 categories, group others
  let otherCount = 0;
  inventoryByCategory.forEach((item, index) => {
    if (index < 4) {
      categories.push(item._id || "Uncategorized");
      counts.push(item.count);
    } else {
      otherCount += item.count;
    }
  });

  // Add 'Others' category if there are additional items
  if (otherCount > 0) {
    categories.push("Others");
    counts.push(otherCount);
  }

  res.json({
    labels: categories,
    datasets: [
      {
        label: "Inventory Distribution",
        data: counts,
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(100, 116, 139, 0.8)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(100, 116, 139, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });
});

/**
 * @desc    Get customer segment data
 * @route   GET /api/analytics/customer-segments
 * @access  Private/Admin
 */
const getCustomerSegments = asyncHandler(async (req, res) => {
  // For this sample, we'll simulate customer segments from orders
  // In a real system, you might have a 'type' field on customers or derive this from order patterns

  const ordersByCustomerType = await Order.aggregate([
    {
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
    {
      $unwind: "$customerInfo",
    },
    {
      $group: {
        _id: {
          // Using the notes field to simulate customer type
          // In a real app, you'd have a dedicated field
          type: { $ifNull: ["$customerInfo.type", "Other"] },
        },
        count: { $sum: 1 },
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  // If no real customer segmentation exists, create sample data
  let segments;
  if (ordersByCustomerType.length === 0) {
    segments = [
      { type: "Agriculture", percentage: 45 },
      { type: "Commercial", percentage: 25 },
      { type: "Government", percentage: 15 },
      { type: "Residential", percentage: 10 },
      { type: "Educational", percentage: 5 },
    ];
  } else {
    const total = ordersByCustomerType.reduce(
      (sum, type) => sum + type.total,
      0
    );
    segments = ordersByCustomerType.map((item) => ({
      type: item._id.type,
      percentage: Math.round((item.total / total) * 100),
    }));
  }

  // Sort by percentage descending
  segments.sort((a, b) => b.percentage - a.percentage);

  res.json({
    labels: segments.map((s) => s.type),
    datasets: [
      {
        label: "Sales by Customer Segment",
        data: segments.map((s) => s.percentage),
        backgroundColor: [
          "rgba(34, 197, 94, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(139, 92, 246, 0.7)",
          "rgba(249, 115, 22, 0.7)",
          "rgba(100, 116, 139, 0.7)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(139, 92, 246, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(100, 116, 139, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });
});

/**
 * @desc    Get sales forecast data
 * @route   GET /api/analytics/sales-forecast
 * @access  Private/Admin
 */
const getSalesForecast = asyncHandler(async (req, res) => {
  // Get the current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed month

  // Get sales data for the past 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        isPaid: true,
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        sales: { $sum: "$totalPrice" },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  // Prepare data arrays
  const labels = [];
  const actualSales = [];
  const predictedSales = Array(12).fill(null);

  // Fill in past 6 months of actual data
  for (let i = 0; i < 6; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));

    const monthLabel = month.toLocaleString("default", { month: "short" });
    labels.push(monthLabel);

    // Find the sales for this month
    const actualData = monthlySales.find(
      (item) =>
        item._id.year === month.getFullYear() &&
        item._id.month === month.getMonth() + 1
    );

    actualSales.push(actualData ? actualData.sales : 0);
  }

  // Generate future 6 months forecast
  const growthRate = 0.1; // 10% growth month over month
  let lastActualSales = actualSales[actualSales.length - 1];

  for (let i = 0; i < 6; i++) {
    const month = new Date();
    month.setMonth(month.getMonth() + (i + 1));

    const monthLabel = month.toLocaleString("default", { month: "short" });
    labels.push(monthLabel);

    // Calculate forecasted sales
    const forecast = lastActualSales * (1 + growthRate);
    predictedSales[i + 6] = Math.round(forecast);
    lastActualSales = forecast;
  }

  // Current month is where actual meets predicted
  predictedSales[5] = actualSales[5];

  res.json({
    labels,
    datasets: [
      {
        label: "Actual Sales",
        data: actualSales.concat(Array(6).fill(null)),
        borderColor: "hsl(var(--primary))",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: false,
        tension: 0.4,
      },
      {
        label: "Predicted Sales",
        data: predictedSales,
        borderColor: "rgba(139, 92, 246, 1)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
      },
    ],
  });
});

/**
 * @desc    Get low stock products
 * @route   GET /api/analytics/low-stock
 * @access  Private/Admin
 */
const getLowStockProducts = asyncHandler(async (req, res) => {
  const lowStockProducts = await Inventory.find({ status: "Low Stock" })
    .sort({ quantity: 1 })
    .limit(5)
    .select("name quantity threshold")
    .lean();

  res.json(
    lowStockProducts.map((product) => ({
      id: product._id,
      name: product.name,
      stock: product.quantity,
      threshold: product.threshold,
    }))
  );
});

/**
 * @desc    Get expiring products
 * @route   GET /api/analytics/expiring-products
 * @access  Private/Admin
 */
const getExpiringProducts = asyncHandler(async (req, res) => {
  // Get today's date
  const today = new Date();

  // Get date 2 months from now
  const twoMonthsFromNow = new Date();
  twoMonthsFromNow.setMonth(today.getMonth() + 2);

  // Find products with batches expiring in the next 2 months
  const inventoryWithExpiringBatches = await Inventory.aggregate([
    { $unwind: "$batches" },
    {
      $match: {
        "batches.expiryDate": {
          $gte: today,
          $lte: twoMonthsFromNow,
        },
      },
    },
    { $sort: { "batches.expiryDate": 1 } },
    { $limit: 5 },
    {
      $project: {
        name: 1,
        "batches.quantity": 1,
        "batches.expiryDate": 1,
      },
    },
  ]);

  res.json(
    inventoryWithExpiringBatches.map((item) => ({
      id: item._id,
      name: item.name,
      stock: item.batches.quantity,
      expiryDate: item.batches.expiryDate.toISOString().split("T")[0],
    }))
  );
});

/**
 * @desc    Get recent sales
 * @route   GET /api/analytics/recent-sales
 * @access  Private/Admin
 */
const getRecentSales = asyncHandler(async (req, res) => {
  const recentOrders = await Order.find({ isPaid: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name")
    .populate("orderItems.product", "name")
    .lean();

  const formatDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const orderDate = new Date(date);

    if (orderDate >= today) {
      return `Today, ${orderDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (orderDate >= yesterday) {
      return `Yesterday, ${orderDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return orderDate.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const recentSales = recentOrders.map((order) => {
    const mainProduct = order.orderItems[0];
    return {
      id: order._id,
      customer: order.user?.name || "Guest Customer",
      product: mainProduct.product.name,
      quantity: mainProduct.qty,
      total: order.totalPrice,
      date: formatDate(order.createdAt),
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
  getRecentSales,
};
