const Alert = require('../models/Alert');
const express = require('express');
const {
  createAlert,
  notifyDonors,
  respondToAlert,
  getBloodBankAlerts,
  getDoctorAlerts
} = require('../controllers/alertController');
const { protectUser, protectBloodBank, authorize } = require('../middleware/auth');

const router = express.Router();

// Médecins - protection User
router.post('/', protectUser, authorize('doctor'), createAlert);
router.get('/doctor', protectUser, authorize('doctor'), getDoctorAlerts);

// Banques de sang - protection BloodBank
router.get('/bloodbank', protectBloodBank, getBloodBankAlerts);
router.post('/notify-donors', protectBloodBank, notifyDonors);

// Donneurs - protection User
router.post('/:alertId/respond', protectUser, authorize('donor'), respondToAlert);


// Donneurs : Récupérer mes alertes actives
router.get('/my', protectUser, async (req, res) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    const alerts = await Alert.find({
      bloodType: req.user.bloodType,
      status: 'pending'
    })
      .populate('bloodBank', 'hospitalName address phone')
      .sort({ createdAt: -1 });

    res.json({ data: alerts });
  } catch (error) {
    console.error("Erreur GET /api/alerts/my :", error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;