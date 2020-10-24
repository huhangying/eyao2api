
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'doctor_consult_comment',
  mongoose.Schema({
    hid: Number,
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true, index: true },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    consult: {type: mongoose.Schema.Types.ObjectId, ref: 'consult', required: true},
    consultType: { type: Number }, // helper

    score: Number,  
    presetComments: [
      {
        type: { type: Number, required: true },   // 1 - 4
        checked: { type: Boolean, default: false }
      }
    ],  
    comment: String,
  }, {
    timestamps: true
})
);