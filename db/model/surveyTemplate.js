const mongoose = require('mongoose');

module.exports = mongoose.model(
    'survey_template',
    mongoose.Schema({
        hid: Number,
        name: { type: String, required: true, trim: true }, // Survey section name
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department', required: true },
        type: { type: Number, required: true, min: 0, max: 7 },
        //group: { type: Schema.Types.ObjectId, ref: 'survey_group' },
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
        availableDays: { type: Number, default: 30 }, // 有效天数, 默认为30天
        apply: { type: Boolean, default: true }
    }, {
        timestamps: true
    })
);