// controllers/requestController.ts
import Request from '../models/Request.js';

// GET /api/requests
export const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({ hospital: req.user.hospital }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// POST /api/requests
export const createRequest = async (req, res) => {
  const { patientId, bloodType, units, urgency } = req.body;
  try {
    const request = new Request({
      patientId,
      bloodType,
      units,
      urgency,
      hospital: req.user.hospital,
      doctor: req.user._id,
    });
    await request.save();
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: "Données invalides" });
  }
};