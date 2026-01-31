const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { validateRegister, validateLogin, runValidation } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, runValidation, registerUser);
router.post('/login', validateLogin, runValidation, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
