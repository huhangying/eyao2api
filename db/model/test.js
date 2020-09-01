const mongoose = require('mongoose');

// 化验单
module.exports = mongoose.model(
  'test',
  mongoose.Schema({
    hid: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
    
    name: { type: String, required: true, trim: true },
    type: { type: String },

    items: [
      {
        item: { type: String, required: true, trim: true },
        code: { type: String },
        unit: { type: String },
        reference: { type: String }, // risk value = 0

        result: { type: Number, trim: true },
        riskValues: [{
          value: { type: Number, min: -3, max: 3 },
          name: { type: String }, // optional
          from: { type: Number },
          to: { type: Number },
        }]
      }
    ],
  }, {
    timestamps: true
  })
);