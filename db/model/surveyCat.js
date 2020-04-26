const mongoose = require('mongoose');

module.exports = mongoose.model(
    'survey_cat',
    mongoose.Schema({
        hid: Number,
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department', required: true },
        name: { type: String, required: true, trim: true }, // Survey Cat name
        desc: { type: String },
        fixed: { type: Boolean, default: false },
        apply: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);