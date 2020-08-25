
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'doctor_consult',
  mongoose.Schema({
    hid: Number,
    doctor_id: { type: String, required: true },
    tags: String,  //自定义标签
    prices: [
      {
        type: Number,
        name: String,
        amount: Number
      }
    ],

    commentCount: { type: Number, default: 0, min: 0 },
    score: { type: Number },
    response_time: { type: Number }, // 平均响应时间

    presetComments: [
      {
        preset: { type: String, required: true },
        count: { type: Number, default: 0, min: 0 }
      }
    ],
  })
);