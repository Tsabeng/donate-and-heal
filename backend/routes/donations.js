// routes/donations.js
const express = require('express');
const Donation = require('../models/Donation'); // ← à créer juste après
const { protectUser, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/donations/my → Historique des dons du donneur connecté
router.get('/my', protectUser, authorize('donor'), async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('bloodBank', 'hospitalName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: donations.length,
      data: donations
    });
  } catch (error) {
    console.error('Erreur GET /api/donations/my :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;