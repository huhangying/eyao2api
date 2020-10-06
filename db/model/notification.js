
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'notification',
    mongoose.Schema({
        hid: Number,
        doctor: { type: mongoose.Schema.Types.ObjectId, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, required: true },
        userName: String,
        icon: String,
        direction: { type: Boolean, required: true },  // true: user -> doctor; false: doctor -> user
        // 類別： 0：chat   1: 不良反应   2: 联合用药   3. 预约取消   4. 付费咨询
        type: { type: Number, required: true }, 
        count: { type: Number, default: 0 }
    }, {
        timestamps: true
    })
);

