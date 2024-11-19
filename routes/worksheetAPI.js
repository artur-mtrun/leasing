const express = require('express');
const router = express.Router();
const worksheetAPIController = require('../controllers/worksheetAPI');

router.get('/employees', worksheetAPIController.getAllEmployees);
router.get('/events', worksheetAPIController.getEvents);
router.get('/data', worksheetAPIController.getWorksheetData);
router.post('/add-entry', worksheetAPIController.addWorksheetEntry);
router.post('/edit-entry/:id', worksheetAPIController.postEditEntry);
router.get('/accounts', worksheetAPIController.getAccounts);
router.get('/worksheet-data', worksheetAPIController.getWorksheetDataForDay);
router.get('/employee-data', worksheetAPIController.getEmployeeData);
router.get('/report', worksheetAPIController.getWorksheetReport);
router.get('/companies', worksheetAPIController.getCompanies);
router.get('/timesheet', worksheetAPIController.getWorksheetTimesheet);

module.exports = router;
