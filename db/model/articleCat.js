
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'article_cat',
    mongoose.Schema({
        //hid: { type: String },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department', required: true },
        name: { type: String, required: true, trim: true }, // article Cat name
        desc: { type: String },
        apply: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);