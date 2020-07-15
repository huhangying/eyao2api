const Notification = require('../model/notification');

module.exports = {

    // get by doctor
    getNotisByDoctor: (req, res, next) => {
        const { did } = req.params;

        Notification.find({ doctor: did, direction: true, hid: req.token.hid })
            .sort({ createdAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // used by patient
    getNotisByUser: (req, res, next) => {
        const { uid } = req.params;

        Notification.find({ user: uid, direction: false, hid: req.token.hid })
            .sort({ createdAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    UpdateNoti: (req, res, next) => {
        const noti = req.body;

        Notification.findOneAndUpdate(
            {
                doctor: noti.doctor,
                user: noti.use,
                direction: noti.direction,
                hid: noti.hid
            },
            { $inc: { count: 1 } },
            { new: true }
        ).then((result) => res.json(result))
            .catch(err => next(err));
    },

    ClearNoti: (req, res, next) => {
        const noti = req.body;
        Notification.findOneAndUpdate(
            {
                doctor: noti.doctor,
                user: noti.use,
                direction: noti.direction,
                hid: noti.hid
            },
            { $set: { count: 0 } },
            { new: true }
        ).then((result) => res.json(result))
            .catch(err => next(err));
    },

}