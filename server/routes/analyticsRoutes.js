const express = require('express');
const router = express.Router();
const { getDashboardData, getItemAnalytics, getRealtimeStats } = require('../controllers/analyticsController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Admin-only routes
router.get('/dashboard', authMiddleware, roleMiddleware(['admin']), getDashboardData);
router.get('/items/:itemId', authMiddleware, roleMiddleware(['admin']), getItemAnalytics);
router.get('/realtime', authMiddleware, roleMiddleware(['admin']), getRealtimeStats);

module.exports = router;
