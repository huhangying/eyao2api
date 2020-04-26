
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
    //created: {type : Date, default: Date.now},
    //updated: {type : Date, default: Date.now},
    apply: { type: Boolean, default: true }
  })
);