/**
 * Created by hhu on 2016/5/7.
 */
module.exports = mongoose.model(
  'doctor',
  new Schema({
    hid: { type: String },
    token: { type: String }, // token should not store into db
    user_id: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: Number, required: true, default: 0 },
    department: { type: Schema.Types.ObjectId, ref: 'department', required: true },
    title: String,
    tel: String,
    cell: String,
    gender: String,
    hours: String,
    expertise: String,
    bulletin: String,
    honor: String,
    icon: String,
    status: { type: Number, default: 0, min: 0, max: 3 },  // 0: idle, 1: busy; 2: away; 3: offline
    shortcuts: { type: String }, // 快捷回复, separated by '|'
    // associates: [ // NO USE now, in case one doctor has multiple positions in hospitals.
    //   {
    //     hid: { type: String },
    //     hdid: { type: String }
    //   }
    // ],
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    locked_count: Number,
    apply: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  })
);