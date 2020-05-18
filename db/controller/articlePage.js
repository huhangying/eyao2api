/**
 * Created by harry on 16/11/20.
 */

var ArticlePage = require('../model/articlePage');
const moment = require('moment');

module.exports = {

    GetAll: (req, res, next) => {

        ArticlePage.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        ArticlePage.findById(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 doctor ID获取 article page list
    GetArticlePagesByDoctorId: (req, res, next) => {
        const { did } = req.params;
        ArticlePage.find({ doctor: did, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    GetArticlePagesByDoctorIdAndCatId: (req, res, next) => {
        const { did, catid } = req.params;
        ArticlePage.find({ cat: catid, doctor: did, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据Cat ID获取 article page list
    GetArticlePagesByCatId: (req, res, next) => {
        const { catid } = req.params;
        ArticlePage.find({ cat: catid, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // to be removed
    // 根据 id 显示 article 页面
    RenderById: (req, res, next) => {
        const { id } = req.params;
        ArticlePage.findOne({ _id: id, hid: req.token.hid })
            .populate({ path: 'doctor', select: 'name title' })
            .then((item) => {
                res.set('Content-Type', 'text/html');
                res.render('article', {
                    content: item.content,
                    name: item.name,
                    title: item.title,
                    timestamp: moment(item.createdAt).format('YYYY 年 M 月 D 日'),
                    doctor: item.doctor.name + ' ' + item.doctor.title
                });
            })
            .catch(err => next(err));
    },

    // 创建页面
    Add: function (req, res) {

        // 获取请求数据（json）
        var item = req.body;

        // doctor
        if (!item.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }

        // name
        if (!item.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }

        // category
        if (!item.cat) {
            return Status.returnStatus(res, Status.NO_CAT);
        }

        // category
        if (!item.title) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        // 不存在，创建
        ArticlePage.create({
            hid: item.hid,
            doctor: item.doctor,
            name: item.name,
            cat: item.cat,
            title: item.title,
            title_image: item.title_image,
            content: item.content
        }, function (err, raw) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            return res.send(raw);
        });

    },

    UpdateById: function (req, res) {
        if (req.params && req.params.id) { // params.id is ID
            var id = req.params.id;

            // 获取数据（json）
            var template = req.body;

            ArticlePage.findById(id, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }

                if (template.name)
                    item.name = template.name;
                if (template.doctor)
                    item.doctor = template.doctor;
                if (template.cat)
                    item.cat = template.cat;
                if (template.title)
                    item.title = template.title;
                if (template.title_image)
                    item.title_image = template.title_image;
                if (template.content)
                    item.content = template.content;
                if (template.apply || template.apply === false)
                    item.apply = template.apply;

                //console.log(JSON.stringify(item));

                //
                item.save(function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    res.json(raw);
                });

            });

        }
    },


    DeleteById: function (req, res) {
        if (req.params && req.params.id) { // params.id is group ID

            ArticlePage.findOne({ _id: req.params.id }, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }

                //
                item.remove(function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    res.json(raw);
                });

            });
        }
    },

}