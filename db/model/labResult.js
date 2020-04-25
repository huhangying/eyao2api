const mongoose = require('mongoose');

module.exports = mongoose.model(
    'lab_result',
    mongoose.Schema({

        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

        name: { type: String, required: true, trim: true },
        list: [
            {
                item: { type: String, required: true, trim: true },
                result: { type: String, trim: true },
                type: { type: Number }
            }
        ],
        testDate: { type: Date }
    }, {
        timestamps: true
    })
);