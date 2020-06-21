
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'article_page',
    mongoose.Schema({
        hid: Number,
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },  // from
        doctor_name: String,
        cat: { type: mongoose.Schema.Types.ObjectId, ref: 'page_cat', required: true }, // remove?
        name: { type: String, required: true, trim: true }, // page section name
        title: { type: String, required: true },
        title_image: { type: String },
        content: { type: String },
        apply: { type: Boolean, default: false } // false: 未发送; true: 已发送
    }, {
        timestamps: true
    })
);