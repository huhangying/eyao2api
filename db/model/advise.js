const mongoose = require('mongoose');

module.exports = mongoose.model(
    'advise',
    mongoose.Schema({
        hid: Number,
        adviseTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'advise_template', required: true },

        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
        doctorName: String,
        doctorTitle: String,
        doctorDepartment: String,

        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        name: { type: String, required: true, trim: true }, // user name
        gender: String,
        age: Number,
        cell: String,

        questions: [
            {
                question: { type: String, required: true, trim: true },
                is_inline: { type: Boolean, default: false },
                weight: { type: Number, default: 0 },
                required: { type: Boolean, default: true },
                order: { type: Number },
                answer_type: { type: Number, required: true, min: 0, max: 3 }, // 0: boolean; 1: radio; 2: multiple; 3: text
                options: [
                    {
                        answer: { type: String },
                        input_required: { type: Boolean, default: false },
                        input: { type: String, trim: true },
                        hint: { type: String },
                        weight: { type: Number },
                        selected: { type: Boolean }
                    }
                ],
            }
        ],
        order: { type: Number },
        isPerformance: { type: Boolean, default: false }, // 是否绩效考核
        isOpen: { type: Boolean, default: true }, // 是否开放线下咨询历史记录给其他药师
        finished: { type: Boolean, default: false },

        // user feedback
        score: Number,
        comment: String,
        feedbackDone: Boolean,
    }, {
        timestamps: true
    })
);