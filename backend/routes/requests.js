// routes/requests.js
const express = require('express');
const Request = require('../models/Request'); // Modèle Mongoose
const { protectUser } = require('../middleware/auth'); // Middleware d'auth

const router = express.Router();

// GET : Récupérer toutes les demandes de l'hôpital du docteur
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

// POST : Créer une nouvelle demande
router.post('/', protectUser, async (req, res) => {
  try {
    const { patientId, bloodType, units, urgency } = req.body;

    const newRequest = new Request({
      patientId: patientId || `PAT-${Date.now()}`,
      bloodType,
      units,
      urgency: urgency || 'normal',
      status: 'pending',
      hospital: req.user.hospital, // Automatique
    });

    await newRequest.save();
    res.status(201).json({ data: newRequest });
  } catch (err) {
    console.error("Erreur POST /api/requests:", err);
    res.status(400).json({ message: err.message || 'Données invalides' });
  }
});

module.exports = router;