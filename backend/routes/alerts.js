// routes/alerts.js
const express = require('express');
const Alert = require('../models/Alert'); // <-- Vérifie que le chemin est bon (../models/Alert)
const {
  createAlert,
  notifyDonors,
  respondToAlert,
  getBloodBankAlerts,
  getDoctorAlerts
} = require('../controllers/alertController');
const { protectUser, protectBloodBank, authorize } = require('../middleware/auth');

const router = express.Router();

// Médecins
router.post('/', protectUser, authorize('doctor'), createAlert);
router.get('/doctor', protectUser, authorize('doctor'), getDoctorAlerts);

// Banques de sang
router.get('/bloodbank', protectBloodBank, getBloodBankAlerts);
router.post('/notify-donors', protectBloodBank, notifyDonors);

// Donneurs
router.post('/:alertId/respond', protectUser, authorize('donor'), respondToAlert);

// NOUVELLE ROUTE CORRIGÉE (une seule fois !)
router.get('/my', protectUser, authorize('donor'), async (req, res) => {
  try {
    const alerts = await Alert.find({
      bloodType: req.user.bloodType,
      status: 'pending'
    })
      .populate('bloodBank', 'hospitalName address phone')
      .populate('doctor', 'name hospital')
      .sort({ urgency: -1, createdAt: -1 });

    res.json({
      success: true,
      data: { alerts }
    });
  } catch (error) {
    console.error("Erreur GET /api/alerts/my :", error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;