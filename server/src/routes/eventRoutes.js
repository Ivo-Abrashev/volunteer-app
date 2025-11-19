// server/src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

// Публични routes (без authentication)
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Защитени routes (изискват login)
router.use(protect); // Всички routes след този ред изискват токен

// Routes за organizer и admin
router.post('/', authorize('organizer', 'admin'), eventController.createEvent);
router.get('/my/events', eventController.getMyEvents);
router.put('/:id', authorize('organizer', 'admin'), eventController.updateEvent);
router.delete('/:id', authorize('organizer', 'admin'), eventController.deleteEvent);

module.exports = router;