const mongoose = require('mongoose');

module.exports = mongoose.model('order',
    mongoose.Schema({
        hid: Number,
        openid: { type: String, required: true }, // M
        userName: { type: String },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
        doctorName: { type: String },
        consultId: { type: String },
        consultType: { type: Number },
        amount: { type: Number }, // 分

        prepay_id: { type: String },
        status: { type: String },

        // come from wxpay
        out_trade_no: { type: String, required: true }, // 商户订单号 ------------- KEY!
        return_code: String,
        total_fee: { type: Number }, // 订单金额 ------
        bank_type: String,
        transaction_id: String, // 微信订单号
        time_end: String,

        return_msg: String, // if error

        // refund
        refund_id: String, // 微信退款单号
        out_refund_no: String, // 商户退款单号
        refund_fee: { type: Number }, // 申请退款金额
        settlement_refund_fee: { type: Number }, // 退款金额
        refund_status: String, // 退款状态
        refund_recv_accout: String, // 退款入账账户
        refund_account: String, // 退款资金来源
        refund_request_source: String, // 退款发起来源
    }, {
        timestamps: true
    })
);