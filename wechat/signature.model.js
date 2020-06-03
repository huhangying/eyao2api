const mongoose = require('mongoose');

module.exports = mongoose.model(
    'signature',
    mongoose.Schema({
        openid: String, // key
        nonceStr: String,
        signature: String,
        timestamp: String
    })
);