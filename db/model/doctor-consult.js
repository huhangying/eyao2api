
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'doctor_consult',
  mongoose.Schema({
    hid: Number,
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true, index: true },

    tags: { type: String },  //自定义标签
    disease_types: { type: String }, // 咨询疾病类型

    commentCount: { type: Number, default: 0, min: 0 },
    score: { type: Number },  // 总体评分
    response_time: { type: Number }, // 平均响应时间

    presetComments: [
      {
        type: { type: Number, required: true },
        count: { type: Number, default: 0, min: 0 }
      }
    ],
  })
);