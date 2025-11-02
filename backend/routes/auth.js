// routes/auth.js
const express = require('express');
const {
  register,
  login,
  getProfile,
  registerBloodBank,
  loginBloodBank,
  getBloodBankProfile,
  validateRegisterUser,
  validateLogin,
  validateRegisterBloodBank,
} = require('../controllers/authController');
const { protectUser, protectBloodBank } = require('../middleware/auth');

const router = express.Router();

// === USER ROUTES ===
router.post('/register', validateRegisterUser, register);
router.post('/login', validateLogin, login);
router.get('/profile', protectUser, getProfile);

// === BLOODBANK ROUTES ===
router.post('/bloodbank/register', validateRegisterBloodBank, registerBloodBank);
router.post('/bloodbank/login', validateLogin, loginBloodBank);
router.get('/bloodbank/profile', protectBloodBank, getBloodBankProfile);

module.exports = router;