/**
 * Created by hhu on 2016/5/20.
 */
var _Group = new Schema({
  hid: { type: String },
    doctor: {type: Schema.Types.ObjectId, ref: 'doctor', required: true },
    name: {type: String, required: true},
    apply: {type : Boolean, default: true}
});

module.exports =  mongoose.model('group', _Group);