
const AdviseComment = require('../model/adviseComment');

module.exports = {

    // 根据药师ID获取信息
    GetAllByDoctorId: (req, res, next) => {
        const { doctor } = req.params;
        AdviseComment.find({ doctor: doctor, hid: req.token.hid })
            .sort({ updatedAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID 和 from， total 获取信息
    GetByDoctorIdAndFromSize: (req, res, next) => {
        const { doctor, from, size } = req.params;
        AdviseComment.find({ doctor: doctor, hid: req.token.hid })
            .sort({ updatedAt: -1 })
            .skip(+from)
            .limit(+size)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    GetById: (req, res, next) => {
        const { aid } = req.params;
        AdviseComment.findOne({advise: aid, hid: req.token.hid })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建
    Add: (req, res, next) => {
        const item = { ...req.body };
        // 参数验证
        // doctor
        if (!item.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        // user
        if (!item.user) {
            return Status.returnStatus(res, Status.NO_USER);
        }
        AdviseComment.create(item)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    DeleteById: (req, res, next) => {
        const { id } = req.params;
        AdviseComment.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}