
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'department',
  mongoose.Schema({
    hid: Number,
    name: String,
    desc: String,
    order: Number,
    assetFolder: { type: String },
    //created: {type : Date, default: Date.now},
    //updated: {type : Date, default: Date.now},
    apply: { type: Boolean, default: true }
  })
);
