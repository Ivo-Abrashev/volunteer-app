// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Публични routes (без authentication)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Защитени routes (изискват токен)
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;