
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'wx_msg_queue',
    mongoose.Schema({
        hid: Number,
        openid: { type: String, required: true },     // to: 微信的ID
        type: { type: Number, default: 0 },  // 1: wechat msg; 2: template message;

        url: { type: String, required: true }, // shared
        // for wechat msg
        title: { type: String },
        description: { type: String, trim: true },
        picurl: { type: String },
        // for wechat template msg
        template_id: { type: String },
        data: mongoose.Schema.Types.Mixed,

        received: { type: Boolean, default: false },
        tryCount: { type: Number, default: 1 },
        errcode: { type: Number },
        doctorid: { type: String }, // 用于微信消息记录
        username: { type: String }, // same as above
    }, {
        timestamps: true
    })
);