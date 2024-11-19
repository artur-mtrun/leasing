const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machines');

router.get('/machine-list', machineController.getMachines);
router.get('/add-machine', machineController.getAddMachine);
router.post('/add-machine', machineController.postAddMachine);
router.post('/remove-machine', machineController.postRemoveMachine);
router.get('/edit-machine/:id', machineController.getEditMachine);
router.post('/edit-machine/:id', machineController.postEditMachine);
module.exports = router;