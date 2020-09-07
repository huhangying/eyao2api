
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'doctor_consult_comment',
  mongoose.Schema({
    hid: Number,
    doctor_id: { type: String, required: true, index: true },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    consult: {type: mongoose.Schema.Types.ObjectId, ref: 'consult', required: true},

    score: Number,  
    presetComments: [
      {
        preset: { type: String, required: true },
        checked: { type: Boolean, default: false }
      }
    ],  
    comment: String,
  }, {
    timestamps: true
})
);