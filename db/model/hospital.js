
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
    mch_id: String, // weixin payment
    partnerKey: String,
    notify_url: String, // http://www.zhaoyaoshi885.cn/api/wechat/notify
    server_ip: String, // use for distributed 
    record: String, // 域名备案号
    // wxcert_path: String,
    csdoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' }, // 
    apply: { type: Boolean, default: true }
  }, {
    timestamps: true
  })
);