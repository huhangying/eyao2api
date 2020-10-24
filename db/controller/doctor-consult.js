
const DoctorConsult = require('../model/doctor-consult');

module.exports = {

    // 根据药师ID获取信息
    GetByDoctorId: (req, res, next) => {
        const { doctor } = req.params;
        DoctorConsult.findOne({ doctor: doctor, hid: req.token.hid})
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建/update
    Update: (req, res, next) => {
        const { doctor } = req.params;
        const doctorConsult = { ...req.body };

        DoctorConsult.updateOne(
            { doctor: doctor, hid: doctorConsult.hid },
            doctorConsult,
            { upsert: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // no use
    DeleteByDoctorId: async (req, res, next) => {
        const { doctor } = req.params;
        DoctorConsult.findOneAndDelete({doctor: doctor, hid: req.token.hid})
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}