const ArticleCat = require('../model/articleCat.js');

module.exports = {

    GetAll: (req, res, next) => {

        ArticleCat.find({ hid: req.token.hid })
            .populate('department')
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        ArticleCat.findOne({ _id: id })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据Department ID获取 page list
    GetArticleCatsByDepartmentId: (req, res, next) => {
        const { did } = req.params;
        ArticleCat.find({ department: did, hid: req.token.hid })
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建问卷类别
    Add: (req, res, next) => {
        const cat = req.body;
        // department
        if (!cat.department) {
            return Status.returnStatus(res, Status.NO_DEPARTMENT);
        }
        // name
        if (!cat.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        ArticleCat.exists({ name: cat.name, department: cat.department, hid: cat.hid }) // check if existed
            .then(result => {
                if (result) return Status.returnStatus(res, Status.EXISTED);

                ArticleCat.create(cat)
                    .then((result) => res.json(result))
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    },

    UpdateById: function (req, res, next) {
        const { id } = req.params;
        const cat = req.body;
        ArticleCat.findByIdAndUpdate(id, cat, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;  // id is schedule ID
        ArticleCat.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },
}