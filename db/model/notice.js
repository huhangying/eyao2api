
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'notices',
    mongoose.Schema({
        hid: Number,
        notices: [
            {
                notice: { type: String, required: true, trim: true },
                days_to_start: { type: Number, required: true },
                during: { type: Number, required: true },
                require_confirm: { type: Boolean, default: true },
                apply: { type: Boolean, default: true }
            }
        ],
        apply: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);