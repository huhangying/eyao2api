/**
 * Created by hhu on 2018/5/31.
 */

var _Hospital = new global.mongoose.Schema({

  hid: String,
  name: String,
  desc: String,
  host: String,
  // parent: {type : String, default: null}, // 用于医院联盟 （下期）
  order: Number,
  //created: {type : Date, default: Date.now},
  //updated: {type : Date, default: Date.now},
  apply: {type : Boolean, default: true}
});

module.exports =  mongoose.model('hospital', _Hospital);