const mongoose = require('mongoose');

module.exports = mongoose.model(
  'test_form',
  mongoose.Schema({
    hid: Number,
    name: { type: String, required: true, trim: true },
    type: { type: Number },

    list: [
      {
        item: { type: String, required: true, trim: true },
        code: { type: String },
        unit: { type: String },
        reference: { type: String },
        // result: { type: String, trim: true }, 
        // sign: { type: String },
      }
    ],
    order: { type: Number },
    apply: { type: Boolean, default: true }
  }, {
    timestamps: true
  })
);