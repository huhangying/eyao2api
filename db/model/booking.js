const mongoose = require('mongoose');

module.exports = mongoose.model(
    'booking',
    mongoose.Schema({
        hid: Number,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // 病患
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true }, // 药师
        schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'schedule', required: true }, // 预约
        date: { type: Date }, // for 搜索
        status: { type: Number, default: 0 }, // 1: 预约完成,可用状态 2: user cancel; 3: doctor cancel;
                                              // 4: pending (药师前转未完成);  5: finished  6. confirm finished
                                              // 7: forwarded pending （药师接手未完成）
        score: { type: Number, min: 0, max: 10, default: 0 },//0: not started yet.
        notes: String,
        created: { type: Date, default: Date.now },
        read: { type: Number, default: 0 }, // for noti. 0: unread;   1: read
    })
);