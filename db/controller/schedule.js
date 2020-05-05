/**
 * Created by hhu on 2016/5/21.
 */

var Schedule = require('../model/schedule.js');
var $q = require('q');

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
    // 根据药师ID 获取相关的门诊, 没有时间限制
    GetAllByDoctorId: (req, res, next) => {
        const { did } = req.params;
        const query = {
            doctor: did,
            hid: req.token.hid,
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
    GetByDoctorIdAndDate: function (req, res) {

        if (req.params && req.params.did && req.params.date) {

            var _date = +new Date(req.params.date);
            Schedule.find({
                doctor: req.params.did,
                apply: true,
                date: { $gte: _date, $lt: (new Date(_date + 24 * 60 * 60 * 1000)) }
            }) // select the selected day
                .sort({ date: 1, period: 1 })
                .exec(function (err, items) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!items || items.length < 1) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.json(items);
                });
        }
    },


    // 根据 ID 和 period id 获取详细信息
    GetByDoctorPeriodDate: function (req, res) {

        if (req.params && req.params.period && req.params.did && req.params.date) {

            Schedule.findOne({ doctor: req.params.did, date: req.params.date, period: req.params.period })
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.json(item);
                });
        }
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


    // 创建门诊
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


    DeleteById: function (req, res) {
        if (req.params && req.params.id) { // params.id is schedule ID

            Schedule.findOne({ _id: req.params.id }, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }

                //
                item.remove(function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    res.json(raw);
                });

            });
        }
    },

    //todo: enhance the performance later
    FindScheduleDoctorsByDepartmentId: function (req, res) {
        if (req.params && req.params.departmentid) {

            var date_end = new Date();
            date_end.setDate(date_end.getDate() + 7);
            Schedule.find({ date: { $lte: date_end, $gt: new Date() }, limit: { $gt: 0 } })
                .populate(
                    {
                        path: 'doctor',
                        match: { department: req.params.departmentid },
                        select: '_id user_id name'
                    }
                )
                .exec(function (err, schedules) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    var doctorsPromise = schedules
                        .map(function (schedule) {
                            return schedule.doctor; // get only doctor field
                        })
                        .filter(function (doctor) {
                            return doctor;      // remove  null
                        });

                    $q.all(doctorsPromise)
                        .then(function (doctors) {
                            res.json(
                                doctors
                                    .filter(function (doctor, pos) {
                                        return doctors.indexOf(doctor) == pos; // remove duplicate ones
                                    })
                            );
                        });

                });
        }
    },


}