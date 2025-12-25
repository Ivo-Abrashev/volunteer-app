// server/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Всички routes изискват admin роля
router.use(protect);
router.use(authorize('admin'));

// User management
router.put('/users/:id/role', adminController.changeUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Statistics
router.get('/statistics', adminController.getStatistics);

module.exports = router;