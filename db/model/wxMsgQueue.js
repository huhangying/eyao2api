
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'wx_msg_queue',
    mongoose.Schema({
        hid: Number,
        openid: { type: String, required: true },     // to: 微信的ID
        type: { type: Number, default: 0 }, // 0: undefined; 1: survey; 2: articlePage; 3: feedback
        title: { type: String, required: true },
        description: { type: String, trim: true },
        url: { type: String, required: true },
        picurl: { type: String },
        received: { type: Boolean, default: false },
        tryCount: { type: Number, default: 0 },
        errcode: { type: Number },
        doctorid: { type: String }, // 用于微信消息记录
        username: { type: String }, // same as above
    }, {
        timestamps: true
    })
);