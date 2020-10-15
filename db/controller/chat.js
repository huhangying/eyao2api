const Chat = require('../model/chat.js');
const Doctor = require('../model/doctor');

module.exports = {

    // for API access
    SendMsg: (req, res, next) => {
        const chat = req.body;
        if (!chat.sender || !chat.to || !chat.room) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        Chat.create(chat)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    getChatHistoryBySenderAndTo: (req, res, next) => {
        const { sender, to } = req.params;
        Chat.find({ hid: req.token.hid, cs: { $ne: true } })
            .or([{ sender: sender, to: to }, { sender: to, to: sender }]) // either sender or
            .sort({ created: -1 })
            .limit(100)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // for test
    GetAllByRoom: (req, res, next) => {
        const { room } = req.params;

        Chat.find({ hid: req.token.hid, room: room })
            .sort({ created: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // used by doctor
    getUnreadByDoctor: (req, res, next) => {
        const { did } = req.params;

        Chat.find({ to: did, hid: req.token.hid, read: 0, cs: { $ne: true } })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // used by patient
    getUnreadByPatient: (req, res, next) => {
        const { uid } = req.params;

        Chat.find({ to: uid, hid: req.token.hid, read: 0, cs: { $ne: true } })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // set read by doctor and user
    setReadByDoctorAndPatient: (req, res, next) => {
        const { did, uid } = req.params;

        Chat.updateMany({ to: did, sender: uid, hid: req.token.hid, read: 0, cs: { $ne: true } },
            { read: 1 })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // set read by user and doctor
    setReadByPatientAndDoctor: (req, res, next) => {
        const { uid, did } = req.params;

        Chat.updateMany({ to: uid, sender: did, hid: req.token.hid, read: 0, cs: { $ne: true } },
            { read: 1 })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    GetById: (req, res, next) => {
        const { id } = req.params;
        Chat.findOne({ _id: id })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Chat.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    //========================= 客服消息相关

    // 病患客服历史消息
    getCsHistoryByUser: (req, res, next) => {
        const { uid } = req.params;
        Chat.find({ hid: req.token.hid, cs: true })
            .or([{ sender: uid }, { to: uid }])
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 客服病患列表 （当日？）
    getCsPatientList: (req, res, next) => {
        const aggregatorOpts = [
            { $match: { hid: req.token.hid, cs: true } },
            { $sort: { create: -1 } },
            {
                $group: {
                    sender: '$sender',
                    // count: { $sum: 1 }
                }
            },
            {
                $unwind: { path: '$sender' }
            },
        ];

        Chat.aggregate(aggregatorOpts)
            .then((result) => res.json(result))
            .catch(err => next(err));

        // Chat.find({ hid: req.token.hid, cs: true })
        //     .sort({ create: -1 })
        //     .distinct('sender')
        //     .then(results => {
        //         Doctor.populate(results, { path: 'sender' })
        //             .then((result) => res.json(result))
        //             .catch(err => next(err));
        //     })
        //     .catch(err => next(err));
    },

    // web side
    getCsUnreadByDoctor: (req, res, next) => {
        const { did } = req.params;

        Chat.find({ to: did, hid: req.token.hid, read: 0, cs: true })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // web side
    setCsReadByDoctorAndPatient: (req, res, next) => {
        const { uid, did } = req.params;

        Chat.updateMany({ to: did, sender: uid, hid: req.token.hid, read: 0, cs: true },
            { read: 1 })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },
}