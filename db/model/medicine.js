
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'medicine',
    mongoose.Schema({
        hid: Number,
        name: { type: String, required: true, trim: true },
        desc: { type: String, trim: true },
        unit: { type: String },
        capacity: { type: Number },
        usage: { type: String }, // 内服外用等
        dosage: {
            intervalDay: { type: Number, default: 1, min: 0 }, // 每几天
            way: { type: String, trim: true }, // 饭前/饭后/隔几小时
            frequency: { type: Number, min: 0 },
            count: { type: Number, min: 0 },
            customized: { type: String } // 如果使用，则忽略上面4项
        },
        // cat: { type: Schema.Types.ObjectId, ref: 'medicine_cat', required: true },
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