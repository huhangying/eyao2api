
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'prescription',
    mongoose.Schema({
        hid: Number,
        booking: { type: mongoose.Schema.Types.ObjectId, ref: 'booking', required: true }, // not required for walk-in
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
        medicines: [{
            name: { type: String, required: true, trim: true },
            desc: { type: String, trim: true },
            unit: { type: String, required: true },
            capacity: { type: Number },
            usage: { type: String }, // 内服外用等
            dosage: {
                intervalDay: { type: Number, default: 1 }, // 每几天
                way: { type: String, trim: true }, // 饭前/饭后/隔几小时
                frequency: { type: Number },
                count: { type: Number, min: 0 },
                customized: { type: String } // 如果使用，则忽略上面4项
            },
            note: { type: String },  // for diagnose!
        }],
        // cat: { type: Schema.Types.ObjectId, ref: 'medicine_cat', required: true },
        notices: [{
            notice: { type: String, required: true, trim: true },
            days_to_start: { type: Number, required: true },
            during: { type: Number, required: true },
            require_confirm: { type: Boolean, default: true },
            apply: { type: Boolean, default: true }
        }]
    }, {
        timestamps: true
    })
);