
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'chatroom',
    mongoose.Schema({
        hid: Number,
        name: String, // 聊天室名([user name]|[doctor name])
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
        doctor_unread: { type: Number, default: 0 },
        user_unread: { type: Number, default: 0 },
        created: { type: Date, default: Date.now },
        updated: { type: Date, default: Date.now }

    })
);