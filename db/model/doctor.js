
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'doctor',
  mongoose.Schema({
    hid: Number,
    token: { type: String }, // token should not store into db
    user_id: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: Number, required: true, default: 0, min: 0, max: 3 }, // 3 is superuser
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'department', required: true },
    title: String,
    tel: String,
    cell: String,
    gender: String,
    hours: String,
    expertise: String,
    bulletin: String,
    honor: String,
    icon: String,
    status: { type: Number, default: 0, min: 0, max: 3 },  // 0: idle, 1: busy; 2: away; 3: offline
    shortcuts: { type: String }, // 快捷回复, separated by '|'
    // associates: [ // NO USE now, in case one doctor has multiple positions in hospitals.
    //   {
    //     hid: Number,
    //     hdid: { type: String }
    //   }
    // ],
    qrcode: String, // 二维码图片地址
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    locked_count: Number,
    apply: { type: Boolean, default: true },
    order: { type: Number, default: 0 },

    hospitalName: String, // only for doctor login response
    wechatUrl: String,     // only for doctor login response
    cs: Boolean, // check if 客服 // only for doctor login response
    serverIp: String, // !!! 服务接入地址 // only for doctor login response
    prices: [
      {
        type: { type: Number, required: true },   // 0: 图文咨询； 1：电话咨询
        amount: { type: Number, required: true, min: 0 },
        unit_count: { type: Number }, // /次 或 /20分钟
      }
    ],
  })
);