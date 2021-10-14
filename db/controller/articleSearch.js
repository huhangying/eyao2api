const ArticleSearch = require('../model/articleSearch');

module.exports = {

    GetAll: (req, res, next) => {
        ArticleSearch.find({ hid: req.token.hid })
            .sort({ update_time: -1, createdAt: -1 })
            .lean()
            .then((results) => res.json(results))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        ArticleSearch.findById(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据keyword 获取article list
    GetSerachResults: (req, res, next) => {
        const { keyword, hid } = req.params;
        const keywordRE = new RegExp(keyword, 'i');
        ArticleSearch.find({
            $or: [{ keywords: keywordRE }, { name: keywordRE }, { title: keywordRE }],
            hid: hid
        })
            .select('-hid -__v')
            .sort({ update_time: -1, createdAt: -1 })
            .limit(20)
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 内部函数
    serachResultsByKeyword: async (keyword, hid) => {
        const keywordRE = new RegExp(keyword, 'i');
        return ArticleSearch.find({
            $or: [{ keywords: keywordRE }, { name: keywordRE }, { title: keywordRE }],
            hid: hid
        })
        .sort({ update_time: -1, createdAt: -1 })
        .limit(20)
        .select('name')
        .lean()
        .then(results => {
            if (!results || results.length < 1) {
                return '';
            }
            return results.map(_ => _.name).join('\n');
        })
        .catch(err => {
            return 'error';
        });
    },

    // 创建文章搜索对应表
    Add: (req, res, next) => {

        // 获取请求数据（json）
        const item = req.body;

        // name
        if (!item.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // title
        if (!item.title) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }
        // targetUrl
        if (!item.targetUrl) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        // 创建
        ArticleSearch.create(item)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        ArticleSearch.findByIdAndUpdate(id, req.body, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    DeleteById: (req, res, next) => {
        const { id } = req.params;
        ArticleSearch.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}