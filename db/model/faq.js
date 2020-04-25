const mongoose = require('mongoose');

module.exports = mongoose.model('faq',
    mongoose.Schema({
        //department: { type: Schema.Types.ObjectId, ref: 'department', required: true },
        question: { type: String, required: true, trim: true },
        answer: { type: String, trim: true },
        order: { type: Number, default: 0 },
        apply: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);