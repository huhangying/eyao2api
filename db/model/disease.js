
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'disease',
    mongoose.Schema({

        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department' },
        name: String,
        desc: String,
        symptoms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'symptom' }],
        //symptoms:[{symptom:{type: Schema.Types.ObjectId, ref: 'symptom' }}],
        order: Number,
        //created: {type : Date, default: Date.now},
        //updated: {type : Date, default: Date.now},
        apply: { type: Boolean, default: true }
    })
);