
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'diagnose',
    mongoose.Schema({
        hid: Number,
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

        booking: { type: mongoose.Schema.Types.ObjectId, ref: 'booking' },
        surveys: [
            {
                type: { type: Number, min: 1, max: 6 },
                list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'survey' }]
            }
        ],
        assessment: {
            score: { type: Number, min: 1, max: 10 },
            assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'survey' }
        },

        prescription: [{
            startDate: { type: Date, default: Date.now },
            endDate: { type: Date },
            name: { type: String, required: true, trim: true },
            desc: { type: String, trim: true },
            unit: { type: String },
            capacity: { type: Number },
            quantity: { type: Number, default: 1 },
            usage: { type: String }, // 内服外用等
            dosage: {
                intervalDay: { type: Number, default: 1, min: 0 }, // 每几天
                frequency: { type: Number },
                count: { type: Number, min: 0 },
                way: { type: String, trim: true }, // 饭前/饭后/隔几小时
                customized: { type: String } // 如果使用，则忽略上面4项
            },
            notices: [{
                notice: { type: String, required: true, trim: true },
                days_to_start: { type: Number, required: true },
                during: { type: Number, required: true },
                require_confirm: { type: Boolean, default: true }
            }],
            notes: { type: String }
        }],
        notices: [{
            startDate: { type: Date, default: Date.now },
            endDate: { type: Date },
            notice: { type: String, required: true, trim: true },
            days_to_start: { type: Number, required: true },
            during: { type: Number, required: true },
            require_confirm: { type: Boolean, default: true }
        }],
        labResults: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'test' }
        ],
        status: { type: Number, min: 0, max: 3, default: 0 }    // 0: assigned to user;  1: user finished; 2: doctor saved; 3: archived
    }, {
        timestamps: true
    })
);