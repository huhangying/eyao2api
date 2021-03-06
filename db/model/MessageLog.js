
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'message_log',
    mongoose.Schema({
        hid: Number,
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },  // from
        user: { type: String, required: true },      // to: 微信的ID
        type: { type: Number, default: 0 }, // 0: undefined; 1: survey; 2: articlePage
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        url: { type: String },
        picurl: { type: String },
        received: { type: Boolean, default: false },
        tryCount: { type: Number, default: 1 }
    }, {
        timestamps: true
    })
);