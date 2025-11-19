// server/src/routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

// Всички routes изискват authentication
router.use(protect);

// User routes (всеки логнат потребител)
router.post('/events/:eventId/register', registrationController.registerForEvent);
router.delete('/events/:eventId/unregister', registrationController.unregisterFromEvent);
router.get('/my-registrations', registrationController.getMyRegistrations);

// Organizer/Admin routes
router.get(
  '/events/:eventId/participants',
  authorize('organizer', 'admin'),
  registrationController.getEventParticipants
);

router.put(
  '/registrations/:registrationId/attendance',
  authorize('organizer', 'admin'),
  registrationController.markAttendance
);

module.exports = router;