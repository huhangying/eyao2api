
const Booking = require('../model/booking.js');
const Schedule = require('../model/schedule.js');
const moment = require('moment');
const mongoose = require('mongoose');

module.exports = {

    GetAll: (req, res, next) => {
        Booking.find({ hid: req.token.hid })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    search: (req, res, next) => {
        const { doctor, start, end, hid } = req.body;
        let searchCriteria = {
            hid: hid
        };
        if (doctor) {
            // const ds = doctor.split('|').map(_ => {
            //     return _ ? mongoose.Types.ObjectId(_) : '';
            // });
            // console.log(ds);
            searchCriteria.doctor = { $in: doctor.split('|') };
        }
        if (start) {
            searchCriteria.date = { $gte: new Date(start) }
        }
        if (end) {
            searchCriteria.date = { $lt: new Date(end) }
        }


        let query = Booking.find(searchCriteria);

        if (doctor) {
            query = query.where('doctor').in(doctor.split('|'));
        }

        query
            .populate([
                {
                    path: 'doctor',
                    select: 'name department title'
                },
                {
                    path: 'schedule',
                    select: 'date period'
                },
                {
                    path: 'user',
                    select: 'name cell gender birthdate'
                }
            ])
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


    // 根据ID获取详细信息 // used by wechat side
    GetById: (req, res, next) => {
        const { id } = req.params;
        Booking.findOne({ _id: id })
            .populate({
                path: 'schedule',
                populate: [
                    {
                        path: 'doctor',
                        populate: { path: 'department', select: '_id name address direction' },
                        select: '_id name title department'
                    },
                    { path: 'period', select: '_id name' },
                ],
                select: 'date period created doctor'
            })
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

    // 根据药师ID 和开始时间 获取相关的预约
    GetByDoctorIdAndFrom: (req, res, next) => {
        const { did, from } = req.params;
        Booking.find({ doctor: did, date: { $gte: new Date(from) }, hid: req.token.hid })
            .sort({ date: -1 })
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

    // 根据药师ID 获取 没有过期的,未读的 病患取消预约
    GetCancelledBookingsByDoctorId: (req, res, next) => {
        const { did } = req.params;
        Booking.find({
            doctor: did,
            hid: req.token.hid,
            status: 2, // status 2: 病患取消预约
            read: { $ne: 1 },
            date: {
                $gte: moment().startOf('day').toDate(),
            },
        })
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

    // set read by doctor and user
    // 用於Web端標識已讀
    setCancelReadByPatientDoctor: (req, res, next) => {
        const { did, uid } = req.params;

        Booking.updateMany({ doctor: did, user: uid, hid: req.token.hid, status: 2 },
            { read: 1 })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // 根据药师ID 获取相关的预约统计
    GetCountsByDoctorId: (req, res, next) => {
        const { did } = req.params;
        Booking.find({ doctor: did, hid: req.token.hid })
            .select('date status')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID当日的的预约
    GetTodaysByDoctorId: (req, res, next) => {
        const { did } = req.params;

        Booking.find({
            doctor: did,
            date: {
                $gte: moment().startOf('day').toDate(),
                $lt: moment().endOf('day').toDate()
            },
            hid: req.token.hid,
            status: 1
        })
            .sort({ created: -1 })
            .populate([
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
                }])
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
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
                        populate: { path: 'department', select: '_id name address direction' },
                        select: '_id name title department'
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
    Add: (req, res, next) => {
        const booking = req.body;

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

        // check double booking (schedule不能有两个booking)
        Booking.findOne({ doctor: booking.doctor, user: booking.user, schedule: booking.schedule, status: 1 }) // status=1 预约完成
            .then(_result => {
                if (_result && _result._id) {
                    // double booking
                    return Status.returnStatus(res, Status.DOUBLE_BOOKING);
                } else {
                    // 检查可预约数是不是
                    Schedule.findOne({ _id: booking.schedule, apply: true, hid: booking.hid })
                        .then(schedule => {
                            if (!schedule || schedule.limit < 1) {
                                // 没有可以预约的门诊，返回错误
                                return Status.returnStatus(res, Status.NO_BOOKING_AVAILABLE);
                            }

                            Booking.create(booking)
                                .then((result) => {
                                    if (result.status === 1) { // status = 4, don't decrease limit
                                        // limit-- in schedule
                                        schedule.limit--;
                                        schedule.save();
                                    }
                                    return res.json(result);
                                })
                                .catch(err => next(err));

                        })
                        .catch(err => next(err));
                }
            })
            .catch(err => next(err));
    },

    // 更新booking
    UpdateById: (req, res, next) => {
        const { id } = req.params;
        // 获取数据（json）,只用於更新status, notes and score
        const booking = req.body;
        Booking.findById(id)
            .select('-hid -__v')
            .then((result) => {
                const original_status = result.status;
                if (booking.status) {
                    result.status = booking.status;
                }
                if (booking.notes) {
                    result.notes = booking.notes
                }
                if (booking.score) { // not allow to enter score=0
                    result.score = booking.score;
                }
                result.save();

                // if status changed from 1 to 2, or 1 to 3, limit++ in schedule table
                if (original_status === 1 && (result.status === 2 || result.status === 3)) {
                    // limit++ in schedule
                    Schedule.findById(result.schedule)
                        .exec(function (err, schedule) {
                            schedule.limit++;
                            schedule.save();
                        });
                }
                return res.json(result);
            })
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;  // id is schedule ID
        Booking.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}