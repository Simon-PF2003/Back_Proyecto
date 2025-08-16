const { Router } = require('express');
const router = Router();
const { verifyToken } = require('../middleware/authMiddleware');
const emailController = require('../controllers/emailController');

router.post('/enviar-correo', verifyToken, emailController.sendEmail );

module.exports = router;
