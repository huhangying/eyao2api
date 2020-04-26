
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'period',
    mongoose.Schema({
        hid: Number,
        name: String, // 可以设置成 上午和下午
        from: { type: Number, required: true }, // time (unit: minute)
        to: { type: Number },
    })
);