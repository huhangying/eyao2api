const mongoose = require('mongoose');

module.exports = mongoose.model(
    'consult_follow',
    mongoose.Schema({
        hid: Number,
        consult_id: { type: mongoose.Schema.Types.ObjectId, ref: 'consult', required: true },      // from
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },      // from
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },  // to
        senderName: String,

        direction: { type: Number, required: true, default: 0 }, // 0: 药师回复; 1: 病患回复
        content: { type: String },
        upload: { type: String },
    }, {
        timestamps: true
    })
);