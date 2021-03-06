/**
 * Created by hhu on 2016/5/21.
 */

const Schedule = require('../model/schedule.js');

module.exports = {

    GetAll: (req, res, next) => {
        const query = {
            hid: req.token.hid,
            date: { $gte: (new Date()) }
        };
        Schedule.find(query)
            .select('-hid -__v')
            .sort({ date: 1 })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    GetAllPopulated: (req, res, next) => {
        const query = {
            hid: req.token.hid,
            date: { $gte: (new Date()) }
        };
        Schedule.find(query)
            .populate('period')
            .select('-hid -__v')
            .sort({ date: 1 })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID 获取相关的门诊(不包括当天的门诊)
    GetByDoctorId: (req, res, next) => {
        // var d = new Date(req.params.date);
        // if(d.getHours() < 12) {
        //     d.setHours(12,0,0,0); // next midnight/midday is midday
        // } else {
        //     d.setHours(24,0,0,0); // next midnight/midday is midnight
        // }
        const { did } = req.params;
        const query = {
            doctor: did,
            hid: req.token.hid,
            apply: true,
            date: { $gte: (+new Date(new Date().setHours(0, 0, 0, 0)) + 24 * 60 * 60 * 1000) }
        }
        Schedule.find(query)
            .select('-hid -__v')
            // .populate('period', '-hid -__v')
            .sort({ date: 1, period: 1 })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // for CMS
    // 根据药师ID 获取相关的门诊, (XX没有时间限制XX), 没有过期的，包括当天的门诊
    GetAllByDoctorId: (req, res, next) => {
        const { did } = req.params;
        const query = {
            doctor: did,
            hid: req.token.hid,
            date: { $gte: (+new Date(new Date().setHours(0, 0, 0, 0))) }
        }
        Schedule.find(query)
            .select('-hid -__v')
            // .populate('period', '-hid -__v')
            .sort({ date: 1, period: 1 })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID和日期 获取相关的门诊
    GetByDoctorIdAndDate: (req, res, next) => {
        const { did, date } = req.params;

        var _date = +new Date(date);
        Schedule.find({
            doctor: did,
            hid: req.token.hid,
            apply: true,
            date: { $gte: _date, $lt: (new Date(_date + 24 * 60 * 60 * 1000)) }
        }) // select the selected day
            .sort({ date: 1, period: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // 根据 ID 和 period id 获取详细信息
    GetByDoctorPeriodDate: (req, res, next) => {
        const { period, did, date } = req.params;
        Schedule.findOne({ doctor: did, date: date, period: period, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 DID 和 start date 获取一星期的 Schedule
    GetOneWeekByDoctorDate: (req, res, next) => {
        const did = req.params.did;
        const date = new Date(req.params.date);
        Schedule.find({
            doctor: did,
            date: { $gte: new Date(date), $lt: (new Date(date.setHours(0, 0, 0, 0) + 7 * 24 * 60 * 60 * 1000)) },
            hid: req.token.hid,
            apply: true
        })
            .select('-hid -__v')
            .populate('period', '_id name order')
            .sort({})
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Schedule.findById(id)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // 创建门诊预约
    Add: (req, res, next) => {
        const schedule = req.body;
        // doctor, date, period
        if (!schedule.doctor || !schedule.period || !schedule.date) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }
        Schedule.findOneAndUpdate(
            { doctor: schedule.doctor, date: schedule.date, period: schedule.period, hid: schedule.hid },
            schedule,
            { new: true, upsert: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const schedule = req.body;
        Schedule.findByIdAndUpdate(id, schedule, { new: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Schedule.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    BatAdd: async (req, res, next) => {
        const batch = req.body;
        if (batch.periods.length < 1 || batch.dates.length < 1) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }
        // const convertedList: Schedule[];
        let schedules = [];
        batch.dates.map(date => {
            batch.periods.map(period => {
                schedules.push({
                    hid: batch.hid,
                    doctor: batch.doctor,
                    period: period,
                    date: date,
                    limit: batch.limit,
                    apply: true
                });
            })
        });

        // check if existed to avoid double schedule
        schedules = await Promise.all(
            schedules.map(async _ => {
                const schedule = { ..._ };
                delete schedule.limit;
                return await Schedule.exists(schedule) ? null : _;
            })
        );
        schedules = schedules.filter(_ => !!_);

        Schedule.insertMany(schedules)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    BatDelete: (req, res, next) => {
        const batch = req.body;
        Schedule.deleteMany({
            doctor: batch.doctor,
            hid: batch.hid,
            date: { $in: batch.dates },
            period: { $in: batch.periods }
        })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 当日起往后3天的所有有效门诊(改为无限制)
    FindForwardAvailable: (req, res, next) => {
        // const { date } = req.params;
        // const date_start = new Date(date).setHours(0, 0, 0, 0);
        Schedule.find({
            // date: { $lt: new Date(date_start + 24 * 60 * 60 * 1000 * 3), $gt: date_start },
            date: { $gt: new Date() },
            limit: { $gt: 0 },
            hid: req.token.hid,
            apply: true
        })
            .select('-hid -__v')
            .lean()
            .populate('doctor', '_id name title department')
            .then(result => res.json(result))
            .catch(err => next(err));
    },

    // 相同时间段内可选的同科室药师
    FindScheduleDoctorsByDepartmentIdAndDate: (req, res, next) => {
        const { departmentid, date, period } = req.params;

        const date_start = new Date(date).setHours(0, 0, 0, 0);
        Schedule.find({
            date: { $lt: new Date(date_start + 24 * 60 * 60 * 1000), $gt: date_start },
            period: period,
            limit: { $gt: 0 },
            hid: req.token.hid,
            apply: true
        })
            .select('doctor')
            .populate(
                {
                    path: 'doctor',
                    match: { department: departmentid },
                    select: '_id name title'
                }
            )
            .then((result) => {
                const doctors = result.map(_ => _.doctor).filter(_ => _); // data map and remove null
                return res.json(doctors.filter((doc, pos) => {
                    return doctors.indexOf(doc) === pos; // remove duplicate ones
                }))
            })
            .catch(err => next(err));
    },

    // for booking-forward: 预留一个预约位置
    ReserveScheduleSpace: (req, res, next) => {
        const { doctorid, date, period } = req.params;

        const date_start = new Date(date).setHours(0, 0, 0, 0);
        Schedule.findOne({
            doctor: doctorid,
            date: { $lt: new Date(date_start + 24 * 60 * 60 * 1000), $gte: date_start },
            period: period,
            limit: { $gt: 0 },
            hid: req.token.hid,
            apply: true
        })
            .select('-hid -__v')
            .then((result) => {
                if (!result) {
                    return Status.returnStatus(res, Status.OPERATION_FAILED);
                }
                result.limit--;
                result.save();
                res.json(result)
            })
            .catch(err => next(err));
    },

    //////////////////////////////////////////////////////
    // Functions

    checkDoctorHasSchedules(did, hid) {
        return Schedule.exists({
            doctor: did,
            hid: hid,
            apply: true,
            date: { $gte: (+new Date(new Date().setHours(0, 0, 0, 0)) + 24 * 60 * 60 * 1000) }
        })
    },


}