// server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Публични routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// ✅ Email verification
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Защитени routes
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;
