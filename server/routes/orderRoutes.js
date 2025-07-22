const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// User routes
router.post('/', authMiddleware, orderCtrl.placeOrder);
router.get('/my', authMiddleware, orderCtrl.getMyOrders);
router.get('/my/:id', authMiddleware, orderCtrl.getOrderDetails);
router.post('/:id/cancel', authMiddleware, orderCtrl.cancelOrder);

// Admin routes
router.get('/admin', authMiddleware, roleMiddleware(['admin']), orderCtrl.getAdminOrders);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), orderCtrl.updateStatus);

module.exports = router;
