const express = require('express');
const router = express.Router();

// Payment routes temporarily disabled
router.all('*', (req, res) => {
  res.status(503).json({ message: 'Payment service temporarily unavailable' });
});

module.exports = router;
