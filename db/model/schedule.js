const mongoose = require('mongoose');

module.exports = mongoose.model(
  'schedule',
  mongoose.Schema({
    hid: { type: String },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true }, // 药师
    period: { type: mongoose.Schema.Types.ObjectId, ref: 'period', required: true },
    date: { type: Date, required: true }, // 日期
    limit: { type: Number, min: 0, max: 100 },
    created: { type: Date, default: Date.now },
    apply: { type: Boolean, default: true }
  })
);