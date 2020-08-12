const Disease = require('../model/disease');

module.exports = {

    GetAll: (req, res, next) => {
        Disease.find({ hid: req.token.hid })
            .sort({ order: 1 })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获得科室下的疾病类别
    GetByDepartmentId: (req, res, next) => {
        const { did } = req.params;
        Disease.find({ department: did, hid: req.token.hid })
            .sort({ order: 1 })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {

        Disease.findOne({ _id: req.params.id })
            .sort({ order: 1 })
            // .populate('department')
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // 创建疾病类别
    Add: (req, res, next) => {
        const disease = req.body;

        // name
        if (!disease.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }

        Disease.create(disease)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        Disease.findByIdAndUpdate(id, req.body, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Disease.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },
}