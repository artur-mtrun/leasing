const express = require('express');
const router = express.Router();

const cardsController = require('../controllers/cards');
router.get('/card-list', cardsController.getCards);
router.get('/add-card', cardsController.getAddCard);
router.post('/add-card', cardsController.postAddCard);
router.post('/delete-card', cardsController.postDeleteCard);
module.exports = router;

