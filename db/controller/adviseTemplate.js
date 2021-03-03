const AdviseTemplate = require('../model/adviseTemplate');

module.exports = {

    GetAll: (req, res, next) => {
        AdviseTemplate.find({ hid: req.token.hid })
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        AdviseTemplate.findById(id)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获取 department 可用的 template list (for CMS)
    GetCmsAdviseTemplatesByDepartmentId: (req, res, next) => {
        const { did } = req.params; // did is department
        const searchCriteria = (did === 'none' || !did) ?
            { deparment: null, hid: req.token.hid } :
            { department: did, hid: req.token.hid }
        AdviseTemplate.find(searchCriteria)
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获取 department 可用的 template list (not for CMS)
    GetAdviseTemplatesByDepartmentId: (req, res, next) => {
        const { did } = req.params; // did is department
        const searchCriteria = (did === 'none' || !did) ?
            { deparment: null, hid: req.token.hid, apply: true } :
            { $or: [{ department: did }, { deparment: null }], hid: req.token.hid, apply: true }
        AdviseTemplate.find(searchCriteria)
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
        AdviseTemplate.create(item)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const template = req.body;
        AdviseTemplate.findByIdAndUpdate(id, template, { new: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        AdviseTemplate.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}