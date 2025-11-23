// models/Request.js
const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
  },
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  },
  units: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'fulfilled'],
    default: 'pending',
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal',
  },
  hospital: {
    type: String,
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', requestSchema);