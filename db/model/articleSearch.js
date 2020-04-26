
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'article_search',
    mongoose.Schema({

        hid: Number,
        name: { type: String, required: true, trim: true }, // page section name
        cat: { type: String }, // 类别
        title: { type: String, required: true },
        title_image: { type: String },
        targetUrl: { type: String, required: true },
        keywords: { type: String } // separated by |
    }, {
        timestamps: true
    })
);