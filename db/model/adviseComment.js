
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'advise_comment',
  mongoose.Schema({
    hid: Number,
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    advise: { type: mongoose.Schema.Types.ObjectId, ref: 'advise', required: true },
    score: Number,
    // presetComments: [
    //   {
    //     type: { type: Number, required: true },   // 1 - 4
    //     checked: { type: Boolean, default: false }
    //   }
    // ],  
    comment: String,
  }, {
    timestamps: true
  })
);