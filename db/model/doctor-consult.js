
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'doctor_consult',
  mongoose.Schema({
    hid: Number,
    doctor_id: { type: String, required: true },
    labels: String, //自定义标签
    score: { type: Number },
    response_time: { type: Number }, // 平均响应时间
    tags: String, // preset comments
    comments: String,
  })
);