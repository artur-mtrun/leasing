const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accounts');

router.get('/account-list', accountController.getAccounts);
router.get('/add-account', accountController.getAddAccount);
router.post('/add-account', accountController.postAddAccount);
router.post('/remove-account', accountController.postRemoveAccount);
router.get('/edit-account/:id', accountController.getEditAccount);
router.post('/edit-account/:id', accountController.postEditAccount);

module.exports = router;

