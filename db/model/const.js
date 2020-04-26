
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'const',
  mongoose.Schema({
    hid: Number,
    name: { type: String, required: true },
    desc: { type: String },
    type: { type: Number, default: 0 }, // 0: string; 1: multiple line string; 2: boolean; 3: number;
    value: { type: String, required: true }
  })
);