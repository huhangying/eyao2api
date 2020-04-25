
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'group',
  mongoose.Schema({
    hid: { type: String },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    name: { type: String, required: true },
    apply: { type: Boolean, default: true }
  })
);