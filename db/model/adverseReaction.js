/**
 * Created by harry on 16/11/29.
 */
var _AdverseReaction = new Schema({
    isCommon: { type: Boolean, default: false },
    department: { type: Schema.Types.ObjectId, ref: 'department' }, // department is required when isCommon is false
    name: { type: String, required: true, trim: true },
    apply: { type: Boolean, default: true }
});

module.exports =  mongoose.model('adverse_reaction', _AdverseReaction);