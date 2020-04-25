const mongoose = require('mongoose');

module.exports = mongoose.model(
    'article_template',
    mongoose.Schema({

        name: { type: String, required: true, trim: true }, // page section name
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department', required: true },
        cat: { type: mongoose.Schema.Types.ObjectId, ref: 'article_cat', required: true },
        title: { type: String },
        title_image: { type: String },
        content: { type: String },
        apply: { type: Boolean, default: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, required: true }
    }, {
        timestamps: true
    })
);