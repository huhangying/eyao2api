const mongoose = require('mongoose');

module.exports = mongoose.model(
    'signature',
    mongoose.Schema({
        hid: Number,
        openid: String, // key
        appId: String,
        nonceStr: String,
        signature: String,
        timestamp: String
    })
);