const express = require('express');
const router = express.Router();
const allEventsController = require('../controllers/allEvents');


router.get('/all-events', allEventsController.getAllEventsPage);

module.exports = router; 