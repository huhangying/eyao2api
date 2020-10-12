
const mongoose = require('mongoose');

module.exports = mongoose.model(
  'hospital',
  mongoose.Schema({
    hid: Number,
    name: String,
    desc: String,
    ipList: [{type : String}],
    // parent: {type : String, default: null}, // 用于医院联盟 （下期）
    wxurl: String,
    wxid: String,
    appid: String,  // wechat
    secret: String, // wechat
    csdoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' }, // 
    apply: { type: Boolean, default: true }
  }, {
    timestamps: true
  })
);