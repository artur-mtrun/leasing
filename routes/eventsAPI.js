const express = require('express');
const router = express.Router();
const eventsApiController = require('../controllers/eventsAPI');


router.get('/events', eventsApiController.getAllEvents);
router.post('/events', eventsApiController.createEvent);
router.put('/events/:id', eventsApiController.updateEvent);
router.delete('/events/:id', eventsApiController.deleteEvent);
router.get('/events/filter', eventsApiController.getEventsByMonthAndEmployee);
router.get('/employees', eventsApiController.getEmployees);
module.exports = router;
