// controllers/authController.js
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// === VALIDATIONS ===
exports.validateRegisterUser = [
  body('name').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').optional().isString(),
  body('role').isIn(['donor', 'doctor']),
  body('bloodType').if(body('role').equals('donor')).notEmpty(),
  body('hospital').if(body('role').equals('doctor')).notEmpty(),
  body('cni').if(body('role').equals('doctor')).notEmpty(),
  body('licenseNumber').if(body('role').equals('doctor')).notEmpty(),
];

exports.validateLogin = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

exports.validateRegisterBloodBank = [
  body('hospitalName').trim().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').optional().isMobilePhone('any'),
  body('address').optional().trim(),
];

// === INSCRIPTION USER ===
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: errors.array(),
    });
  }

  try {
    const {
      name, email, password, phone, role,
      bloodType, hospital, cni, licenseNumber,
      medicalHistory, status
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé.',
      });
    }

    const user = await User.create({
      name, email, password, phone, role,
      bloodType: role === 'donor' ? bloodType : undefined,
      hospital: role === 'doctor' ? hospital : undefined,
      cni: role === 'doctor' ? cni : undefined,
      licenseNumber: role === 'doctor' ? licenseNumber : undefined,
      medicalHistory: role === 'donor' ? medicalHistory : undefined,
      status: role === 'donor' ? status : 'available',
    });

    const token = signToken(user._id);
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      data: { user },
    });
  } catch (error) {
    console.error('Erreur register user:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// === CONNEXION USER ===
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé.',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    user.password = undefined;

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// === INSCRIPTION BLOODBANK ===
exports.registerBloodBank = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { hospitalName, email, password, phone, address, location } = req.body;

    const existing = await BloodBank.findOne({
      $or: [{ email }, { hospitalName }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email ou nom d\'hôpital déjà utilisé.',
      });
    }

    const bloodBank = await BloodBank.create({
      hospitalName, email, password, phone, address, location,
      isActive: true,
    });

    const token = signToken(bloodBank._id);
    bloodBank.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Banque de sang créée',
      token,
      data: { bloodBank },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// === CONNEXION BLOODBANK ===
exports.loginBloodBank = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const bloodBank = await BloodBank.findOne({ email }).select('+password');
    if (!bloodBank || !(await bcrypt.compare(password, bloodBank.password))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    if (!bloodBank.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé.',
      });
    }

    const token = signToken(bloodBank._id);
    bloodBank.password = undefined;

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      data: { bloodBank },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// === PROFIL USER ===
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// === PROFIL BLOODBANK ===
exports.getBloodBankProfile = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findById(req.bloodBank._id).select('-password');
    if (!bloodBank) {
      return res.status(404).json({ success: false, message: 'Banque non trouvée' });
    }

    res.json({
      success: true,
      data: { bloodBank },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};