const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logs');


router.get('/logs-list', logsController.getLogs);

module.exports = router; 