
const DoctorConsultComment = require('../model/doctor-consult-comment');

module.exports = {

    // 根据药师ID获取信息
    GetAllByDoctorId: (req, res, next) => {
        const { doctor } = req.params;
        DoctorConsultComment.findOne({ doctor_id: doctor, hid: req.token.hid })
            .sort({ updatedAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID 和 from， total 获取信息
    GetByDoctorIdAndFromSize: (req, res, next) => {
        const { doctor, from, size } = req.params;
        DoctorConsultComment.findOne({ doctor_id: doctor, hid: req.token.hid })
            .sort({ updatedAt: -1 })
            .skip(from)
            .limit(size)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建
    Add: (req, res, next) => {
        const dcc = { ...req.body };
        // 参数验证
        // doctor_id
        if (!dcc.doctor_id) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        DoctorConsultComment.create(dcc)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    DeleteById: async (req, res, next) => {
        const { id } = req.params;
        DoctorConsultComment.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}