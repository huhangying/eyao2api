const mongoose = require('mongoose');

module.exports = mongoose.model(
    'access_token',
    mongoose.Schema({
        hid: Number,
        access_token: String,
        expires_time: Number,
    }, {
        timestamps: true
    })
);