const express = require('express');
const router = express.Router();
const menuCtrl = require('../controllers/menuController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.get('/', menuCtrl.getAllItems);
router.post('/', authMiddleware, roleMiddleware(['admin']), menuCtrl.addItem);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), menuCtrl.updateItem);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), menuCtrl.deleteItem);

module.exports = router;
