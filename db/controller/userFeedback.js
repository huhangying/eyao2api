/**
 * Created by ehuhang on 12/2/2016.
 */

var UserFeedback = require('../model/userFeedback');

module.exports = {

    GetAll: (req, res, next) => {
        UserFeedback.find({ hid: req.token.hid })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        UserFeedback.findById(id)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据患者 ID, 类型 获取相关类型的反馈
    GetByUserId: (req, res, next) => {
        const { uid, type } = req.params;
        UserFeedback.find({ user: uid, type: type, hid: req.token.hid })
            .populate({
                path: 'doctor',
                select: 'name title'
            })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));

    },

    GetByUserIdDoctorId: (req, res, next) => {
        const { uid, did, type } = req.params;
        UserFeedback.find({ user: uid, did, type: type, hid: req.token.hid })
            .populate({
                path: 'doctor',
                select: 'name title'
            })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师 ID, 类型 获取相关类型的反馈
    GetByDoctorId: (req, res, next) => {
        const { did, type } = req.params;
        UserFeedback.find({ doctor: did, type: type, hid: req.token.hid })
            .sort({ created: -1 })
            //.populate('user')
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师 ID, 类型 获取相关类型的反馈
    GetUnreadByDoctorId: (req, res, next) => {
        const { did, type } = req.params;
        UserFeedback.find({ doctor: did, type: type, hid: req.token.hid, status: 0 }) // only 1 and 0 for now.
            .sort({ created: -1 })
            .populate('user', 'name icon')
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据病患 ID, 类型 获取相关的反馈
    GetUnreadByDoctorIdUserId: (req, res, next) => {
        const { uid, did, type } = req.params;
        UserFeedback.find({ doctor: did, user: uid, type: type, hid: req.token.hid, status: 2 }) // only 2 and 0 for now.
            .populate({
                path: 'doctor',
                select: 'name title'
            })
            .sort({ created: -1 })
            //.populate('user', 'name icon')
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师 ID, 类型 获取相关类型的反馈个数
    GetUnreadCountByDoctorId: (req, res, next) => {
        const { did, type } = req.params;
        UserFeedback.count({ doctor: did, type: type, hid: req.token.hid, status: 0 }) // 0 is unread.
        .then((count) => res.json({count: count}))
        .catch(err => next(err));
    },

    // 创建Feedback
    Add: function (req, res) {

        // 获取请求数据（json）
        var feedback = req.body;

        // doctor, user, schedule
        if (!feedback.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        if (!feedback.user) {
            return Status.returnStatus(res, Status.NO_USER);
        }
        if (!feedback.type) {
            return Status.returnStatus(res, Status.NO_TYPE);
        }
        if (!feedback.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }

        // 不存在，创建
        UserFeedback.create({
            hid: feedback.hid,
            doctor: feedback.doctor,
            user: feedback.user,
            type: feedback.type,
            name: feedback.name,
            how: feedback.how,
            startDate: feedback.startDate,
            endDate: feedback.endDate,
            notes: feedback.notes,
            status: feedback.status || 0 // 0: 创建
        }, function (err, raw) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            return res.send(raw);
        });

    },

    // 更新Feedback Status ONLY!
    UpdateById: function (req, res) {
        if (req.params && req.params.id) { // params.id is feedback ID
            var id = req.params.id;

            // 获取数据（json）,只能更新status and score
            var feedback = req.body;

            UserFeedback.findById(id)
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    if (feedback.status) {
                        item.status = feedback.status;
                    }

                    item.save(function (err, raw) {
                        if (err) {
                            return Status.returnStatus(res, Status.ERROR, err);
                        }

                        res.json(raw);
                    });

                });
        }
    },

    DeleteById:  (req, res, next) => {
        const { id } = req.params;
        UserFeedback.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    }

}