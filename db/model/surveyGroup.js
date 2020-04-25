const mongoose = require('mongoose');

module.exports = mongoose.model(
    'survey_group',
    mongoose.Schema({
        hid: { type: String },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department', required: true },
        type: { type: Number, required: true, min: 0, max: 5 },
        name: { type: String, required: true, trim: true }, // Survey group name
        desc: { type: String },
        order: { type: Number },
        apply: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);