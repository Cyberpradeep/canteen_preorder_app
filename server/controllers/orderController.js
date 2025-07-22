const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

exports.placeOrder = async (req, res) => {
  try {
    const { items, specialInstructions } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    const itemDetails = await Promise.all(items.map(async (item) => {
      const menuItem = await MenuItem.findById(item.itemId);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.itemId}`);
      }
      totalAmount += menuItem.price * item.quantity;
      return {
        item: item.itemId,
        quantity: item.quantity
      };
    }));

    const newOrder = new Order({
      user: req.user._id,
      items: itemDetails,
      amount: totalAmount,
      specialInstructions,
      estimatedReadyTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
      status: 'pending',
      paymentStatus: 'not_required'
    });

    await newOrder.save();

    // Emit socket event for real-time updates
    const { io } = require('../server');
    io.to('admin').emit('new-order', {
      orderId: newOrder._id,
      status: 'pending'
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.item')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.item')
      .populate('user', 'name email')
      .lean()
      .exec();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the user is authorized to view this order
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, estimatedReadyTime } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only admin can update order status
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    order.status = status;
    if (estimatedReadyTime) {
      order.estimatedReadyTime = new Date(estimatedReadyTime);
    }

    // Auto-complete order when status is ready
    if (status === 'ready') {
      setTimeout(async () => {
        order.status = 'completed';
        await order.save();
        
        // Notify user of completion
        io.to(`user_${order.user}`).emit('order-status-updated', {
          orderId: order._id,
          status: 'completed'
        });
      }, 30 * 60000); // Auto-complete after 30 minutes
    }

    await order.save();

    // Emit socket event for real-time updates
    const { io } = require('../server');
    io.to(`user_${order.user}`).emit('order-status-updated', {
      orderId: order._id,
      status: order.status,
      estimatedReadyTime: order.estimatedReadyTime
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel order that is being prepared or ready' });
    }

    // Check if the user is authorized to cancel this order
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    order.status = 'cancelled';
    await order.save();

    // Emit socket event for real-time updates
    const { io } = require('../server');
    io.to('admin').emit('order-cancelled', {
      orderId: order._id,
      userId: order.user
    });

    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    // Only admin can access all orders
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { status, date } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(query)
      .populate('items.item')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
