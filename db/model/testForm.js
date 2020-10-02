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
        isFormatted: { type: Boolean }, // false: 自由模式
        reference: { type: String },  // 自由模式参考值
        // 支持格式化的参考值
        unit: { type: String },
        referenceFrom: { type: Number, min: 0 }, // 正常参考值
        referenceTo: { type: Number, min: 0 },
        riskValues: [
          {
            value: { type: Number, min: -3, max: 3 },
            name: { type: String }, // optional
            from: { type: Number },
            to: { type: Number },
          }
        ],
        order: { type: Number },
        apply: { type: Boolean, default: true }
      }
    ],
    order: { type: Number },
    apply: { type: Boolean, default: true }
  }, {
    timestamps: true
  })
);