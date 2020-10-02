const mongoose = require('mongoose');

// 化验单
module.exports = mongoose.model(
  'test',
  mongoose.Schema({
    hid: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
    date: { type: Date, default: Date.now }, //化验日期

    name: { type: String, required: true, trim: true },
    type: { type: String },

    items: [
      {
        item: { type: String, required: true, trim: true },
        code: { type: String },
        result: { type: Number, trim: true },

        isFormatted: { type: Boolean }, // false: 自由模式
        reference: { type: String },  // 自由模式参考值
        // 支持格式化的参考值
        unit: { type: String },
        referenceFrom: { type: Number, min: 0 }, // 正常参考值
        referenceTo: { type: Number, min: 0 },
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