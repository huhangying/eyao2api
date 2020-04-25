
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'article_page',
    mongoose.Schema({

        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },  // from
        // userList: [
        //         {type: String }
        // ],      // to
        name: { type: String, required: true, trim: true }, // page section name
        cat: { type: mongoose.Schema.Types.ObjectId, ref: 'page_cat', required: true }, // remove?
        title: { type: String, required: true },
        title_image: { type: String },
        content: { type: String },
        apply: { type: Boolean, default: false } // false: 未发送; true: 已发送

    }, {
        timestamps: true
    })
);