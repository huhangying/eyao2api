
var Booking = require('../model/booking.js');
var Schedule = require('../model/schedule.js');
const moment = require('moment');

module.exports = {

    GetAll: (req, res, next) => {
        Booking.find({ hid: req.token.hid })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // CMS 用
    GetAllPopulated: (req, res, next) => {
        Booking.find({ hid: req.token.hid })
            .populate('schedule')
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Booking.findOne({ _id: id })
            .populate('schedule')
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据患者ID 获取相关的预约
    GetByUserId: (req, res, next) => {
        const { uid } = req.params;
        Booking.find({ user: uid })
            .sort({ created: -1 })
            .populate('schedule')
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID 获取相关的预约
    GetByDoctorId: (req, res, next) => {
        const { did } = req.params;
        Booking.find({ doctor: did, hid: req.token.hid })
            .sort({ created: -1 })
            .populate([
                {
                    path: 'schedule',
                    select: '-__v -hid'
                },
                {
                    path: 'user',
                    select: '_id name link_id cell gender birthdate visitedDepartments'
                }
            ])
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID和日期 获取相关的预约
    GetTodaysByDoctorId: (req, res, next) => {
        const { did } = req.params;

        Booking.find({
            doctor: did,
            date: {
                $gt: moment().startOf('day').toDate(),
                $lt: moment().endOf('day').toDate()
            },
            hid: req.token.hid,
            status: 1
        })
            // .sort({ created: -1 })
            .populate(
                {
                    path: 'user',
                    select: '_id name link_id cell gender birthdate visitedDepartments'
                },
                {
                    path: 'schedule',
                    // populate: {
                    //     path: 'period',
                    //     select: 'name -_id'
                    // },
                    select: 'date period',
                })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
        // .exec(function (err, items) {
        //     if (err) {
        //         return Status.returnStatus(res, Status.ERROR, err);
        //     }

        //     // if (!items || items.length < 1) {
        //     //     return Status.returnStatus(res, Status.NULL);
        //     // }

        //     items = items.filter(function (item) {
        //         if (item.schedule && item.schedule._doc && item.schedule._doc.date) {
        //             return moment(item.schedule._doc.date).format('YYYY-MM-DD') == today;
        //         }
        //     });

        //     res.json(items);
        // });
    },

    // Wechat:
    getPopulatedBookingsByUser: (req, res, next) => {
        const { uid } = req.params;
        Booking.find({ user: uid, hid: req.token.hid })
            .sort({ created: -1 })
            .populate({
                path: 'schedule',
                populate: [
                    {
                        path: 'doctor',
                        populate: 'department',
                        select: '_id name department'
                    },
                    { path: 'period', select: '_id name' },
                ],
                select: 'date period created doctor'
            })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    //
    GetByScheduleId: (req, res, next) => {
        const { sid } = req.params;
        Booking.find({ schedule: sid, hid: req.token.hid })
            .sort({ created: -1 })
            .populate('schedule')
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },



    // 创建预约
    Add: function (req, res) {

        // 获取请求数据（json）
        var booking = req.body;

        // doctor, user, schedule
        if (!booking.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        if (!booking.user) {
            return Status.returnStatus(res, Status.NO_USER);
        }
        if (!booking.schedule) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }



        // 不存在，创建
        Booking.create({
            hid: booking.hid,
            doctor: booking.doctor,
            user: booking.user,
            schedule: booking.schedule,
            date: booking.date,
            status: booking.status || 0 // 0: 创建
        }, function (err, raw) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            // limit-- in schedule
            Schedule.findById(booking.schedule)
                .exec(function (err, schedule) {
                    schedule.limit--;
                    schedule.save();
                });

            return res.send(raw);
        });

    },

    // 更新booking
    UpdateById: function (req, res) {
        if (req.params && req.params.id) { // params.id is booking ID
            var id = req.params.id;

            // 获取数据（json）,只能更新status and score
            var booking = req.body;

            Booking.findById(id)
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    if (booking.date) {
                        item.date = booking.date;
                    }

                    var original_status = item.status;
                    if (booking.status) {
                        item.status = booking.status;
                    }

                    if (booking.score)
                        item.score = booking.score;

                    //console.log(JSON.stringify(item));

                    //
                    item.save(function (err, raw) {
                        if (err) {
                            return Status.returnStatus(res, Status.ERROR, err);
                        }

                        // if status changed from 1 to 2, or 1 to 3, limit++ in schedule table
                        if (original_status === 1 && (item.status === 2 || item.status === 3)) {
                            // limit++ in schedule
                            Schedule.findById(item.schedule)
                                .exec(function (err, schedule) {
                                    schedule.limit++;
                                    schedule.save();
                                });
                        }

                        res.json(raw);
                    });

                });
        }
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;  // id is schedule ID
        Booking.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}