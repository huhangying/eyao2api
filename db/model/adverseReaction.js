
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'adverse_reaction',
    mongoose.Schema({
        isCommon: { type: Boolean, default: false },
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'department' }, // department is required when isCommon is false
        name: { type: String, required: true, trim: true },
        apply: { type: Boolean, default: true }
    })
);