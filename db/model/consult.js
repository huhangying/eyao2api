const mongoose = require('mongoose');

module.exports = mongoose.model(
    'consult',
    mongoose.Schema({
        hid: Number,
        parent: String, // used to group one Paid Consult.
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },      // from
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },  // to
        userName: String, // 标识 consult 消息的方向, 有值表示从病患到药师

        out_trade_no: { type: String }, // 商户订单号
        total_fee: { type: Number }, // fen
        disease_types: [{ type: String }], // 咨询疾病类型 （！病患发起的消息时必选，如果没有此项，则为病患后续交互消息）
        content: { type: String }, // 问题描述
        cell: { type: String }, // 电话咨询时必选
        address: { type: String }, // 可选
        upload: { type: String },

        type: { type: Number, min: 0, max: 6 }, // 0: 图文咨询； 1：电话咨询;// 5/6 is chat in consult
        setCharged: { type: Boolean },  // 药师设置，if true 
        finished: { type: Boolean, required: true, default: false },
        
        status: { type: Number, default: 0, min: 0, max: 4 } // 类似feedback设计。 0: after user sent;  2: 药师回复； 4： 药师拒绝
    }, {
        timestamps: true
    })
);