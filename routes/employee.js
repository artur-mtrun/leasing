const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const employeesController = require('../controllers/employees');
const { addEmployeeValidators } = require('../validators/employeevalidators');

router.get('/', employeesController.getEmployees);

router.get('/add-employee', employeesController.getAddEmployee);
router.post('/add-employee', addEmployeeValidators, employeesController.postAddEmployee);
router.post('/remove-card', employeesController.postRemoveCard);
router.post('/assign-card', addEmployeeValidators, employeesController.postAssignCard);
module.exports = router;