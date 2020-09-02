const Test = require('../model/test');

module.exports = {

    GetByList: (req, res, next) => {
        const {list} = req.params;
        const testIds = list.split('|');
        Test.find({ hid: req.token.hid })
            .in('_id', testIds)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Test.findById(id)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 user 获取 
    GetByUserId: (req, res, next) => {
        const { user } = req.params;

        Test.find({ user: user, hid: req.token.hid })
            .sort({ date: -1 })
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
        // user
        if (!item.user) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }

        // 创建 with no conditions
        Test.create(item)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        Test.findByIdAndUpdate(id, req.body, { new: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Test.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}