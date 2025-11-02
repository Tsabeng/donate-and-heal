// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false, // Ne jamais renvoyer le mot de passe
  },
  role: {
    type: String,
    enum: ['donor', 'doctor'],
    required: [true, 'Le rôle est requis'],
  },
  phone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
  },
  // === DONNEUR ===
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: function () {
      return this.role === 'donor';
    },
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
  },
  medicalHistory: {
    type: String,
    default: '',
  },
  // === MÉDECIN ===
  hospital: {
    type: String,
    required: function () {
      return this.role === 'doctor';
    },
  },
  cni: {
    type: String,
    required: function () {
      return this.role === 'doctor';
    },
  },
  licenseNumber: {
    type: String,
    required: function () {
      return this.role === 'doctor';
    },
  },
  // === GÉNÉRAL ===
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
  fcmToken: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: Date,
}, {
  timestamps: true,
});

// === INDEX ===
userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1 });
userSchema.index({ bloodType: 1 });
userSchema.index({ email: 1 });

// === HACHAGE MOT DE PASSE ===
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// === MÉTHODES ===
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLocation = function (latitude, longitude) {
  this.location = {
    type: 'Point',
    coordinates: [longitude, latitude], // GeoJSON: [lng, lat]
  };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);