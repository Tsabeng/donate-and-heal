// routes/requests.js
const express = require('express');
const Request = require('../models/Request');
const BloodBank = require('../models/BloodBank');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { protectUser, protectBloodBank } = require('../middleware/auth');

const router = express.Router();

// === DOCTEUR : Récupérer ses propres demandes ===
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

// === DOCTEUR : Créer une demande ===
router.post('/', protectUser, async (req, res) => {
  try {
    const { bloodType, units, urgency } = req.body;
    const patientId = req.body.patientId || `PAT-${Date.now()}`;

    const newRequest = new Request({
      patientId,
      bloodType,
      units,
      urgency: urgency || 'normal',
      status: 'pending',
      hospital: req.user.hospital,
      requestedBy: req.user._id,
    });

    await newRequest.save();
    res.status(201).json({ data: newRequest });
  } catch (err) {
    console.error("Erreur POST /api/requests:", err);
    res.status(400).json({ message: err.message || 'Données invalides' });
  }
});

// === BANQUE : Voir toutes les demandes en attente ===
router.get('/all-pending', protectBloodBank, async (req, res) => {
  Request.find({ status: 'pending' })
    .populate('requestedBy', 'name')
    .sort({ urgency: -1, createdAt: -1 })
    .then(requests => res.json({ data: requests }))
    .catch(err => {
      console.error("Erreur GET /all-pending:", err);
      res.status(500).json({ message: 'Erreur serveur' });
    });
});

// === BANQUE : Valider une demande + ENVOYER ALERTE AUX DONNEURS ===
router.patch('/:id/fulfill', protectBloodBank, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande non trouvée' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Déjà traitée' });

    const bloodBank = await BloodBank.findById(req.bloodBank._id);
    if (!bloodBank) return res.status(404).json({ message: 'Banque non trouvée' });

    const currentStock = bloodBank.inventory[request.bloodType] || 0;
    if (currentStock < request.units) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    // Mise à jour stock
    bloodBank.inventory[request.bloodType] = currentStock - request.units;
    await bloodBank.save();

    // Marquer demande comme remplie
    request.status = 'fulfilled';
    await request.save();

    // ENVOI ALERTE AUX DONNEURS COMPATIBLES
    try {
      const compatibleDonors = await User.find({
        role: 'donor',
        bloodType: request.bloodType,
        isAvailable: true
      });

      if (compatibleDonors.length > 0) {
        const alertsToCreate = compatibleDonors.map(donor => ({
          doctor: request.requestedBy,
          bloodBank: req.bloodBank._id,
          bloodType: request.bloodType,
          quantity: request.units,
          urgency: request.urgency === 'urgent' ? 'critical' : 'high',
          status: 'pending', // INDISPENSABLE
          patientInfo: {
            name: request.patientId,
            condition: `Besoin urgent de ${request.units} unité(s) ${request.bloodType}`
          }
        }));

        await Alert.insertMany(alertsToCreate);
        console.log(`ALERTES ENVOYÉES À ${alertsToCreate.length} DONNEURS`);
      }
    } catch (alertError) {
      console.error("Erreur envoi alertes :", alertError);
    }

    res.json({ data: request });
  } catch (err) {
    console.error("Erreur PATCH /fulfill:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;