const mongoose = require('mongoose');

// 化验单模板
module.exports = mongoose.model(
  'test_form',
  mongoose.Schema({
    hid: Number,
    name: { type: String, required: true, trim: true },
    type: { type: String },

    items: [
      {
        item: { type: String, required: true, trim: true },
        code: { type: String },
        unit: { type: String },
        // reference: { type: String },
        riskValues: [
          {
            value: { type: Number, min: -3, max: 3 },
            name: { type: String }, // optional
            from: { type: Number },
            to: { type: Number },
          }
        ]
      }
    ],
    order: { type: Number },
    apply: { type: Boolean, default: true }
  }, {
    timestamps: true
  })
);