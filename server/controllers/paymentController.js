const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

exports.createOrder = async (req, res) => {
  const { amount, items } = req.body;

  const options = {
    amount: amount * 100, // amount in smallest currency unit (₹ -> paise)
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    
    // Create a pending order in our database
    const newOrder = new Order({
      user: req.user._id,
      items: items.map(item => ({
        item: item.itemId,
        quantity: item.quantity
      })),
      status: 'pending',
      paymentId: order.id,
      amount: amount
    });
    await newOrder.save();

    res.json({
      ...order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Update order status
    const order = await Order.findOne({ paymentId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = 'preparing';
    order.transactionId = razorpay_payment_id;
    await order.save();

    // Emit socket event for real-time updates
    const { io } = require('../server');
    io.to(`user_${order.user}`).emit('order-status-updated', {
      orderId: order._id,
      status: 'preparing'
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentStatus = async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      status: order.status,
      paymentId: order.transactionId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
