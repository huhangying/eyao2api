const ArticleTemplate = require('../model/articleTemplate');

module.exports = {

    GetAll: (req, res, next) => {

        ArticleTemplate.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        ArticleTemplate.findById(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    //todo: move to articlePage
    RenderById: function (req, res) {
        if (req.params && req.params.id) {

            ArticleTemplate.findOne({ _id: req.params.id })
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.set('Content-Type', 'text/html');
                    res.render('article', { content: item.content, name: item.name, title: item.title });
                });
        }
    },

    // 根据Cat ID获取 article template list
    GetArticleTemplatesByCatId: (req, res, next) => {
        const { catid } = req.params;
        ArticleTemplate.find({ cat: catid, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据Department ID获取article template list
    GetArticleTemplatesByDepartmentId: (req, res, next) => {
        const { did } = req.params;
        ArticleTemplate.find({ department: did, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建关系组
    Add: (req, res, next) => {
        const item = req.body;
        // name
        if (!item.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // department
        if (!item.department) {
            return Status.returnStatus(res, Status.NO_DEPARTMENT);
        }
        // category
        if (!item.cat) {
            return Status.returnStatus(res, Status.NO_CAT);
        }
        if (!item.updatedBy) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        ArticleTemplate.create(item)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: function (req, res, next) {
        const { id } = req.params;
        const template = req.body;
        ArticleTemplate.findByIdAndUpdate(id, template, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;  // id is article template ID
        ArticleTemplate.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}