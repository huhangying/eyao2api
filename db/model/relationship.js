
const mongoose = require('mongoose');

const Relationship = mongoose.model(
    'relationship',
    mongoose.Schema({
        hid: Number,
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
        group: { type: mongoose.Schema.Types.ObjectId, ref: 'group' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        apply: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);

module.exports = Relationship;