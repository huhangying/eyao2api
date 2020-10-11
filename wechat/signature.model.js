const mongoose = require('mongoose');
//todo: remove
module.exports = mongoose.model(
    'signature',
    mongoose.Schema({
        openid: String, // key
        nonce: String,
        signature: String,
        timestamp: Number
    })
);