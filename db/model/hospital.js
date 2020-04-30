
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'hospital',
  mongoose.Schema({
    hid: Number,
    name: String,
    desc: String,
    host: String,
    // parent: {type : String, default: null}, // 用于医院联盟 （下期）
    order: Number,
    apply: { type: Boolean, default: true }
  }, {
    timestamps: true
  })
);