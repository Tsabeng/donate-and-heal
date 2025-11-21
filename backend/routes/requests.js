// routes/requests.js
const express = require('express');
const Request = require('../models/Request');
const { protectUser } = require('../middleware/auth');
const { protectBloodBank } = require('../middleware/auth'); // ← Ligne ajoutée

const router = express.Router();

// === Routes existantes (doctor/donor) - ON NE TOUCHE PAS ===
router.get('/', protectUser, async (req, res) => {
  try {
    const requests = await Request.find({ hospital: req.user.hospital })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ data: requests });
  } catch (err) {
    console.error("Erreur GET /api/requests:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.post('/', protectUser, async (req, res) => {
  try {
    const { patientId, bloodType, units, urgency } = req.body;
    const newRequest = new Request({
      patientId: patientId || `PAT-${Date.now()}`,
      bloodType,
      units,
      urgency: urgency || 'normal',
      status: 'pending',
      hospital: req.user.hospital,
    });
    await newRequest.save();
    res.status(201).json({ data: newRequest });
  } catch (err) {
    console.error("Erreur POST /api/requests:", err);
    res.status(400).json({ message: err.message || 'Données invalides' });
  }
});

// === NOUVELLE ROUTE BLOOD BANK (ajoutée) ===
router.get('/bloodbank/pending', protectBloodBank, async (req, res) => {
  try {
    const requests = await Request.find({
      hospital: req.bloodBank._id,
      status: 'pending'
    })
      .populate('requestedBy', 'name')
      .sort({ urgency: -1, createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error("Erreur GET /bloodbank/pending:", err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;