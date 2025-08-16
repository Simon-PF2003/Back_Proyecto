const { Router } = require('express');
const router = Router();
const billsController = require('../controllers/billsController');

//POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS POSTS 
router.post('/generateNewBill', billsController.generateNewBill);

//GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS GETS 
router.get('/getBills', billsController.getBills);

module.exports = router;