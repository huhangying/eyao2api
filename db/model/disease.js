
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'disease',
    mongoose.Schema({
        hid: Number,
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department' },
        name: String,
        order: Number,
    })
);