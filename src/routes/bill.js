const { Router } = require('express');
const router = Router();
const billsController = require('../controllers/billsController');

router.post('/generateNewBill', billsController.generateNewBill);

router.get('/getBills', billsController.getBills);

module.exports = router;