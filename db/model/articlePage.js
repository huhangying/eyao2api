
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'article_page',
    mongoose.Schema({
        hid: Number,
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },  // from
        doctor_name: String,
        cat: { type: mongoose.Schema.Types.ObjectId, ref: 'article_cat', required: true }, 
        name: { type: String, required: true, trim: true }, // page section name
        title: { type: String, required: true },
        title_image: { type: String },
        content: { type: String },
    }, {
        timestamps: true
    })
);