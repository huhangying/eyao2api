const TestForm = require('../model/testForm');

module.exports = {

    GetAll: (req, res, next) => {
        TestForm.find({ hid: req.token.hid })
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        TestForm.findById(id)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 type 获取 list
    GetTestFormTemplatesByType: (req, res, next) => {
        const { type } = req.params;
        TestForm.find({
            type: type,
            hid: req.token.hid
        })
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建
    Add: (req, res, next) => {
        const item = req.body;
        // name
        if (!item.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }

        // 创建 with no conditions
        TestForm.create(item)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        TestForm.findByIdAndUpdate(id, req.body, { new: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        TestForm.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}