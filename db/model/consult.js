const mongoose = require('mongoose');

module.exports = mongoose.model(
    'consult',
    mongoose.Schema({
        hid: Number,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },      // from
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },  // to
        senderName: String,

        disease_types: [{ type: String }], // 咨询疾病类型
        content: { type: String }, // 问题描述
        upload: { type: String },
        status: { type: Number, default: 0, min: 0, max: 3 } // 0: new; 1. 药师 mark done; 2: 药师回复；
    }, {
        timestamps: true
    })
);