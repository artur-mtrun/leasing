const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companies');

router.get('/company-list', companyController.getCompanies);
router.get('/add-company', companyController.getAddCompany);
router.post('/add-company', companyController.postAddCompany);
router.post('/remove-company', companyController.postRemoveCompany);
router.get('/edit-company/:id', companyController.getEditCompany);
router.post('/edit-company/:id', companyController.postEditCompany);

module.exports = router;

