const mongoose = require('mongoose');

module.exports = mongoose.model(
    'advise_template',
    mongoose.Schema({
        hid: Number,
        name: { type: String, required: true, trim: true },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department' },

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
                apply: { type: Boolean }
            }
        ],
        order: { type: Number },
        apply: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);