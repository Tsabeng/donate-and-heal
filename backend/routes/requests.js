// routes/requests.js
const express = require('express');
const Request = require('../models/Request');
const BloodBank = require('../models/BloodBank');
const Alert = require('../models/Alert'); // <--- AJOUT
const User = require('../models/User');   // <--- AJOUT
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
    const { patientId, bloodType, units, urgency } = req.body;

    const newRequest = new Request({
      patientId: patientId || `PAT-${Date.now()}`,
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

// === BANQUE DE SANG : Voir TOUTES les demandes en attente ===
router.get('/all-pending', protectBloodBank, async (req, res) => {
  try {
    const requests = await Request.find({ status: 'pending' })
      .populate('requestedBy', 'name')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(100);
    res.json({ data: requests });
  } catch (err) {
    console.error("Erreur GET /all-pending:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// === BANQUE DE SANG : Valider une demande + ENVOYER ALERTE AUX DONNEURS ===
router.patch('/:id/fulfill', protectBloodBank, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Demande non trouvée' });
    if (request.status !== 'pending') return res.status(400).json({ message: 'Déjà traitée' });

    // Vérification + mise à jour stock banque
    const bloodBank = await BloodBank.findById(req.bloodBank._id);
    const currentStock = bloodBank.inventory[request.bloodType] || 0;
    if (currentStock < request.units) return res.status(400).json({ message: 'Stock insuffisant' });

    bloodBank.inventory[request.bloodType] = currentStock - request.units;
    await bloodBank.save();

    // Marquer la demande comme remplie
    request.status = 'fulfilled';
    await request.save();

   // ========== ENVOI AUTOMATIQUE D'UNE ALERTE AUX DONNEURS COMPATIBLES ==========
try {
  const compatibleDonors = await User.find({
    role: 'donor',
    bloodType: request.bloodType,
    isAvailable: true
  });

  if (compatibleDonors.length > 0) {
    const alertPromises = compatibleDonors.map(donor =>
      Alert.create({
        doctor: request.requestedBy,
        bloodBank: req.bloodBank._id,
        bloodType: request.bloodType,
        quantity: request.units,
        urgency: request.urgency === 'urgent' ? 'critical' : 'high',
        status: 'pending', // <--- OBLIGATOIRE !!!
        patientInfo: {
          name: request.patientId,
          condition: `Demande validée – besoin de ${request.units} unité(s) ${request.bloodType}`
        }
      })
    );

    await Promise.all(alertPromises);
    console.log(`Alerte envoyée à ${compatibleDonors.length} donneurs compatibles`);
  }
} catch (alertErr) {
  console.error("Échec envoi alerte donneurs :", alertErr);
}

    res.json({ data: request });
  } catch (err) {
    console.error("Erreur PATCH /fulfill:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;