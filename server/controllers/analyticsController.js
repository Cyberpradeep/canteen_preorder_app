const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const mongoose = require('mongoose');

exports.getDashboardData = async (req, res) => {
  try {
    const dailyOrders = await Order.aggregate([
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
        }
      }},
      { $sort: { _id: 1 } }
    ]);

    const dailyRevenue = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ["completed", "ready"] },
          paymentStatus: "completed"
        }
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: 'menuitems',
          localField: 'items.item',
          foreignField: '_id',
          as: 'menuDetails'
        }
      },
      { $unwind: "$menuDetails" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: { $multiply: ["$items.quantity", "$menuDetails.price"] } },
          totalWithTax: { $sum: { $multiply: [{ $multiply: ["$items.quantity", "$menuDetails.price"] }, 1.18] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topItems = await Order.aggregate([
      { 
        $match: { 
          status: { $in: ["completed", "ready"] },
          paymentStatus: "completed"
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.item",
          totalQty: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$amount"] } }
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItem'
        }
      },
      { $unwind: "$menuItem" },
      { 
        $project: { 
          name: "$menuItem.name", 
          category: "$menuItem.category",
          totalQty: 1,
          revenue: 1,
          averageOrderSize: { $divide: ["$totalQty", { $size: "$orders" }] }
        } 
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 }
    ]);

    const orderStatusSummary = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          averageAmount: { $avg: "$amount" },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const peakHours = await Order.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({ 
      dailyOrders, 
      dailyRevenue, 
      topItems,
      orderStatusSummary,
      peakHours,
      lastUpdated: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItemAnalytics = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { 'items.item': mongoose.Types.ObjectId(itemId) };
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const itemStats = await Order.aggregate([
      { $match: query },
      { $unwind: '$items' },
      { $match: { 'items.item': mongoose.Types.ObjectId(itemId) } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$amount"] } },
          orders: { $addToSet: "$_id" }
        }
      },
      {
        $project: {
          date: "$_id",
          quantity: 1,
          revenue: 1,
          orderCount: { $size: "$orders" }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(itemStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRealtimeStats = async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0,0,0,0));

    const todayStats = await Order.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] }
          },
          preparingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "preparing"] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          totalRevenue: { $sum: "$amount" },
          averageOrderValue: { $avg: "$amount" }
        }
      }
    ]);

    res.json({
      ...todayStats[0],
      lastUpdated: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
