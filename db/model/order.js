const mongoose = require('mongoose');

module.exports = mongoose.model('order',
    mongoose.Schema({
        hid: Number,
        openid: { type: String, required: true },
        userName: { type: String },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
        doctorName: { type: String },
        consultId: { type: String },
        consultType: { type: Number },
        amount: { type: Number, required: true }, // 分

        // for weixin pay
        orderId: { type: String, required: true }, // !
        // refundId: String,
        prepay_id: { type: String },
        status: { type: String },
    }, {
        timestamps: true
    })
);