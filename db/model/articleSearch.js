
const mongoose = require('mongoose');

module.exports = mongoose.model(
    'article_search',
    mongoose.Schema({

        hid: Number,
        name: { type: String, required: true, trim: true }, // page section name
        cat: { type: String }, // 类别
        title: { type: String, required: true },
        title_image: { type: String }, // wx: http://mmbiz.qpic.cn/mmbiz_jpg/JM5hl86vEIzzfVY8gpLBvKQiaYAAazCO9Gbl0maVG2KpqnqQeia7o2qzQFU6tHUat71WNgRc5YZzxyNKHH8kgo2Q/0?wx_fmt=jpeg
        targetUrl: { type: String, required: true }, // wx: http://mp.weixin.qq.com/s?__biz=MzIxNTMzNTM0MA==&mid=100000079&idx=1&sn=c5bef41ef4665408aaee381238df549f#rd
        keywords: { type: String }, // separated by |
        author: String, // wx
        digest: String, // wx
        update_time: Number, // wx
    }, {
        timestamps: true
    })
);