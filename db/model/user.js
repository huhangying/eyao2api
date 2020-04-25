const mongoose = require('mongoose');

module.exports = mongoose.model(
  'user',
  mongoose.Schema({
    link_id: String,
    cell: String,
    name: String,
    password: String,
    role: { type: Number, default: 1, min: 0, max: 1 }, // 0: registered; 1: authorized;
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    associates: [
      {
        hid: { type: String },
        huid: { type: String }
      }
    ],
    icon: String,
    gender: String,
    height: { type: String },
    weight: { type: String },
    birthdate: { type: Date },
    sin: String,
    admissionNumber: { type: String },
    visitedDepartments: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'department' }
    ], //用来判定应该使用初诊问卷还是复诊问卷
    locked_count: Number,
    apply: { type: Boolean, default: true }
  })
);