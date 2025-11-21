// middleware/auth.js — VERSION ULTIME (compatible doctor + bloodbank)
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');

const protectUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé. Token manquant.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 1. Essai comme User / Doctor / Donor
    const user = await User.findById(decoded.id);
    if (user) {
      if (!user.isActive) {
        return res.status(401).json({ success: false, message: 'Compte désactivé.' });
      }
      req.user = user;
      return next();
    }

    // 2. Si pas user → essai comme BloodBank
    const bloodBank = await BloodBank.findById(decoded.id);
    if (bloodBank) {
      if (!bloodBank.isActive) {
        return res.status(401).json({ success: false, message: 'Compte désactivé.' });
      }
      req.bloodBank = bloodBank;
      // TRUC GÉNIAL : on simule un req.user.hospital pour que ta route /requests marche !
      req.user = { hospital: bloodBank._id };
      return next();
    }

    return res.status(401).json({ success: false, message: 'Utilisateur non trouvé.' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
  }
};

// On garde les anciens pour compatibilité
const protectBloodBank = protectUser; // ← maintenant identique !

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Le rôle ${req.user?.role || 'inconnu'} n'est pas autorisé.`
      });
    }
    next();
  };
};

module.exports = { protectUser, protectBloodBank, authorize };