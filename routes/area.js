const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areas');

router.get('/area-list', areaController.getAreas);
router.get('/add-area', areaController.getAddArea);
router.post('/add-area', areaController.postAddArea);

// Dodaj te nowe trasy
router.get('/edit-area/:areaId', areaController.getEditArea);
router.post('/edit-area', areaController.postEditArea);
router.post('/delete-area', areaController.postDeleteArea);

module.exports = router;
