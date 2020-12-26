const Consult = require('../model/consult');

module.exports = {

    GetAll: (req, res, next) => {

        Consult.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    search: (req, res, next) => {
        const { doctor, start, end, hid, type } = req.body;
        let searchCriteria = {
            hid: hid,
            type: type
        };        
        if (start || end) {
            if (start && end) {
                searchCriteria.created = { $gte: new Date(start), $lt: new Date(end) };
            } else if (start) {
                searchCriteria.created = { $gte: new Date(start) };
            } else if (end) {
                searchCriteria.created = { $lt: new Date(end) };
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

        Consult.find(searchCriteria)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Consult.findById(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 Doctor ID 获取未处理列表
    GetPendingByDoctorId: (req, res, next) => {
        const { did } = req.params;
        Consult.find({
            doctor: did,
            finished: false,
            type: { $ne: null },
            hid: req.token.hid
        })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 Doctor ID, Use ID, NO-type 获取
    GetPendingByDoctorIdAndUserId: (req, res, next) => {
        const { did, uid } = req.params;
        Consult.findOne({
            user: uid,
            doctor: did,
            finished: false,
            type: { $eq: null },
            hid: req.token.hid
        })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 Doctor ID, Use ID, type 获取 所有的历史记录（包括未完成的）
    GetConsultsByDoctorIdUserIdAndType: (req, res, next) => {
        const { did, uid, type } = req.params;
        Consult.find({
            user: uid,
            doctor: did,
            type: type,
            hid: req.token.hid
        })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 Doctor ID, Use ID 获取所有的 consults
    GetConsultsByDoctorIdAndUserId: (req, res, next) => {
        const { did, uid } = req.params;
        Consult.find({
            user: uid,
            doctor: did,
            // finished: false,
            type: { $ne: null },
            hid: req.token.hid
        })
            .sort({ createdAt: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 Doctor ID, Use ID 获取所有的 consults
    CheckConsultExistedByDoctorIdAndUserId: (req, res, next) => {
        const { did, uid } = req.params;
        Consult.findOne({
            user: uid,
            doctor: did,
            finished: false,
            type: { $ne: null },
            hid: req.token.hid
        })
            .then((result) => {
                if (result && result._id) {
                    res.json({ exists: true, type: result.type, consultId: result._id });
                } else {
                    res.json({ exists: false });
                }
            }) // true or false
            .catch(err => next(err));
    },

    // 根据 Doctor ID, Use ID 获取所有的 consults
    MarkDoneByDoctorUserAndType: (req, res, next) => {
        const { did, uid, type } = req.params;
        Consult.updateMany({
            user: uid,
            doctor: did,
            finished: false,
            type: type,
            hid: req.token.hid
        }, { finished: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建收费咨询
    Add: (req, res, next) => {
        const data = req.body;
        // user
        if (!data.user) {
            return Status.returnStatus(res, Status.NO_USER);
        }
        // doctor
        if (!data.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        Consult.findOneAndUpdate({
            doctor: data.doctor,
            user: data.user,
            type: data.type,
            out_trade_no: data.out_trade_no,
            finished: false,
            hid: data.hid
        }, data, { new: true, upsert: true }) // check if existed
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: function (req, res, next) {
        const { id } = req.params;
        const item = req.body;
        Consult.findByIdAndUpdate(id, item, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // delete one if type=null, finished: false
    DeletePendingByDoctorIdAndUserId: (req, res, next) => {
        const { did, uid } = req.params;
        Consult.findOneAndDelete({
            user: uid,
            doctor: did,
            finished: false,
            type: { $eq: null },
            hid: req.token.hid
        })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Consult.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },
}