const Advise = require('../model/advise');
const moment = require('moment');

module.exports = {

    GetAll: (req, res, next) => {
        Advise.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Advise.findById(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获取病患线下咨询历史记录
    // used by Doctor-side
    GetUserAdviseHistory: (req, res, next) => {
        const { user, doctor } = req.params;

        Advise.find({
            user: user,
            $or: [{ isOpen: true, docotor: { $ne: doctor } }, { docotor: doctor }], // 开放给其他药师的，加上药师本身的
            hid: req.token.hid,
            finished: true
        })
            .sort({ updatedAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获取病患线下咨询历史记录
    // used by Patient-Side
    GetAdviseHistoryByUser: (req, res, next) => {
        const { user } = req.params;

        Advise.find({
            user: user,
            hid: req.token.hid,
            finished: true
        })
            .sort({ updatedAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获取 Today's doctor 的未完成 advises
    GetDoctorPendingAdvises: (req, res, next) => {
        const { doctor } = req.params;

        Advise.find({
            doctor: doctor,
            hid: req.token.hid,
            finished: false,
            updatedAt: {
                $gte: moment().startOf('day').toDate(),
            }
        })
            // .populate({ path: 'doctor', select: 'name title department' })
            .sort({ updatedAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    search: (req, res, next) => {
        const { doctor, start, end, hid } = req.body;
        let searchCriteria = {
            hid: hid,
        };

        if (start || end) {
            if (start && end) {
                searchCriteria.createdAt = { $gte: new Date(start), $lt: new Date(end) };
            } else if (start) {
                searchCriteria.createdAt = { $gte: new Date(start) };
            } else if (end) {
                searchCriteria.createdAt = { $lt: new Date(end) };
            }
        }
        if (doctor) {
            const doctors = doctor.split('|');
            if (doctors.length === 1) {
                searchCriteria.doctor = doctor;
            } else {
                searchCriteria.doctor = { $in: doctors };
            }
        }

        Advise.find(searchCriteria)
            .select('-hid -__v')
            .lean()
            .then((results) => res.json(results))
            .catch(err => next(err));
    },

    // 创建
    Add: (req, res, next) => {
        const advise = req.body;

        // doctor
        if (!advise.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        // name
        if (!advise.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }

        // 不存在，创建
        Advise.create(advise)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const advise = req.body;

        Advise.findByIdAndUpdate(id, advise, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Advise.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}