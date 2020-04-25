const mongoose = require('mongoose');

module.exports = mongoose.model(
    'symptom',
    mongoose.Schema({

        name: String,
        desc: { type: String, select: false },
        //created: {type : Date, default: Date.now},
        //updated: {type : Date, default: Date.now},
        apply: { type: Boolean, default: true, select: false }
    })
);