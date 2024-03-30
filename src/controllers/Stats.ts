import { TryCatch } from "../middlewares/Error.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import {
  calculatePercentage,
  getChartData,
  getInventories,
} from "../utils/Features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats;

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const thisMonth = {
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: today,
  };
  const lastMonth = {
    start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
    end: new Date(today.getFullYear(), today.getMonth(), 0),
  };

  const thisMonthProducts = await Product.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });

  const lastMonthProducts = await Product.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const thisMonthUsers = await User.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });

  const lastMonthUsers = await User.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const thisMonthOrders = await Order.find({
    createdAt: {
      $gte: thisMonth.start,
      $lte: thisMonth.end,
    },
  });

  const lastMonthOrders = await Order.find({
    createdAt: {
      $gte: lastMonth.start,
      $lte: lastMonth.end,
    },
  });

  const lastSixMonthOrders = await Order.find({
    createdAt: {
      $gte: sixMonthsAgo,
      $lte: today,
    },
  });

  const latestTransactions = await Order.find({})
    .select(["orderItems", "discount", "total", "status"])
    .limit(4);

  const femaleUserCount = await User.countDocuments({ gender: "female" });

  const categories = await Product.distinct("category");

  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();
  const allOrders = await Order.find({}).select("total");

  const thisMonthRevenue = thisMonthOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  const lastMonthRevenue = lastMonthOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  const changePercent = {
    revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
    product: calculatePercentage(
      thisMonthProducts.length,
      lastMonthProducts.length
    ),
    user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
    order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
  };

  const revenue = allOrders.reduce(
    (total, order) => total + (order.total || 0),
    0
  );

  const count = {
    revenue,
    user: usersCount,
    product: productsCount,
    order: allOrders.length,
  };

  const orderMonthCounts = new Array(6).fill(0);
  const orderMonthlyRevenue = new Array(6).fill(0);

  lastSixMonthOrders.forEach((order) => {
    const creationDate = order.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < 6) {
      orderMonthCounts[6 - monthDiff - 1] += 1;
      orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
    }
  });

  const categoryCount = await getInventories({
    categories,
    productsCount,
  });

  const userRatio = {
    female: femaleUserCount,
    male: usersCount - femaleUserCount,
  };

  const modifiedLatestTransaction = latestTransactions.map((i) => ({
    _id: i._id,
    discount: i.discount,
    amount: i.total,
    quantity: i.orderItems.length,
    status: i.status,
  }));

  stats = {
    categoryCount,
    userRatio,
    changePercent,
    count,
    chart: {
      order: orderMonthCounts,
      revenue: orderMonthlyRevenue,
    },
    latestTransactions: modifiedLatestTransaction,
  };

  return res.status(200).json({
    success: true,
    message: "Dashboard data fetched Successfully",
    stats,
  });
});

export const getPieChart = TryCatch(async (req, res, next) => {
  let charts;

  const [
    processingOrder,
    shippedOrder,
    deliveredOrder,
    categories,
    productsCount,
    productsOutOfStock,
    allOrders,
    allUsers,
    adminUsers,
    customerUsers,
  ] = await Promise.all([
    Order.countDocuments({ status: "Processing" }),
    Order.countDocuments({ status: "Shipped" }),
    Order.countDocuments({ status: "Delivered" }),
    Product.distinct("category"),
    Product.countDocuments(),
    Product.countDocuments({ stock: 0 }),
    Order.find({}).select([
      "total",
      "discount",
      "subtotal",
      "tax",
      "shippingCharges",
    ]),
    User.find({}).select(["dob"]),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "user" }),
  ]);

  const orderFullFillment = {
    processing: processingOrder,
    shipped: shippedOrder,
    delivered: deliveredOrder,
  };

  const productCategories = await getInventories({
    categories,
    productsCount,
  });

  const stockAvailability = {
    inStock: productsCount - productsOutOfStock,
    outOfStock: productsOutOfStock,
  };

  const grossIncome = allOrders.reduce(
    (prev, order) => prev + (order.total || 0),
    0
  );

  const discount = allOrders.reduce(
    (prev, order) => prev + (order.discount || 0),
    0
  );

  const productionCost = allOrders.reduce(
    (prev, order) => prev + (order.shippingCharges || 0),
    0
  );

  const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

  const marketingCost = Math.round(grossIncome * (30 / 100));

  const netMargin =
    grossIncome - discount - productionCost - burnt - marketingCost;

  const revenueDistribution = {
    netMargin,
    discount,
    productionCost,
    burnt,
    marketingCost,
  };

  const usersAgeGroup = {
    teen: allUsers.filter((i) => i.age <= 20).length,
    adult: allUsers.filter((i) => i.age > 20 && i.age <= 40).length,
    old: allUsers.filter((i) => i.age > 40).length,
  };

  const adminCustomer = {
    admin: adminUsers,
    customer: customerUsers,
  };

  charts = {
    orderFullFillment,
    productCategories,
    stockAvailability,
    revenueDistribution,
    usersAgeGroup,
    adminCustomer,
  };

  return res.status(200).json({
    success: true,
    message: "Charts-Data Fetched Successfully",
    charts,
  });
});

export const getBarChart = TryCatch(async (req, res, next) => {
  let charts;

  const today = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const sixMonthProductPromise = Product.find({
    createdAt: {
      $gte: sixMonthsAgo,
      $lte: today,
    },
  }).select("createdAt");

  const sixMonthUserPromise = User.find({
    createdAt: {
      $gte: sixMonthsAgo,
      $lte: today,
    },
  }).select("createdAt");

  const twelveMonthOrderPromise = Order.find({
    createdAt: {
      $gte: twelveMonthsAgo,
      $lte: today,
    },
  }).select("createdAt");

  const [products, users, orders] = await Promise.all([
    sixMonthProductPromise,
    sixMonthUserPromise,
    twelveMonthOrderPromise,
  ]);

  const productCounts = getChartData({ length: 6, docArr: products, today });
  const userCounts = getChartData({ length: 6, docArr: users, today });
  const ordersCounts = getChartData({ length: 12, docArr: orders, today });

  charts = {
    users: userCounts,
    products: productCounts,
    orders: ordersCounts,
  };

  return res.status(200).json({
    success: true,
    message: "BarChart-Data Fetched Successfully",
    charts,
  });
});

export const getLineChart = TryCatch(async (req, res, next) => {
  let charts;

  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const baseQuery = {
    createdAt: {
      $gte: twelveMonthsAgo,
      $lte: today,
    },
  };

  const [products, users, orders] = await Promise.all([
    Product.find(baseQuery).select("createdAt"),
    User.find(baseQuery).select("createdAt"),
    Order.find(baseQuery).select(["createdAt", "discount", "total"]),
  ]);

  const productCounts = getChartData({ length: 12, docArr: products, today });
  const userCounts = getChartData({ length: 12, docArr: users, today });
  const discount = getChartData({
    length: 12,
    docArr: orders,
    today,
    property: "discount",
  });
  const revenue = getChartData({
    length: 12,
    docArr: orders,
    today,
    property: "total",
  });

  charts = {
    users: userCounts,
    products: productCounts,
    discount,
    revenue,
  };
  return res.status(200).json({
    success: true,
    message: "LineChart-Data Fetched Successfully",
    charts,
  });
});
