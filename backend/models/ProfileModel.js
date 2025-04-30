const mongoose = require('mongoose');

const perfilSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  surname: String,
  dateOfBirth: Date,
  school: String,
  imageUrl: String,
}, { timestamps: true });

module.exports = mongoose.model('Perfil', perfilSchema);
