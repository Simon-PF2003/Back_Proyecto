const { Router } = require('express');
const router = Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadImage');
const ProfileController = require('../controllers/profileController');

router.post('/upload-profile-image', verifyToken, upload.single('profileImage'), ProfileController.uploadImage);

module.exports = router;