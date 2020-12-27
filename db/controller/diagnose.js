

var Diagnose = require('../model/diagnose');
const moment = require('moment');
const Survey = require('../model/survey');
const Booking = require('../model/booking');

module.exports = {

    // 药品使用
    searchMedicineUsage: (req, res, next) => {
        const { doctor, start, end, hid } = req.body;
        let searchCriteria = {
            hid: hid,
            status: 3, // achived/finished
        };
        if (start || end) {
            if (start && end) {
                searchCriteria.updatedAt = { $gte: new Date(start), $lt: new Date(end) };
            } else if (start) {
                searchCriteria.updatedAt = { $gte: new Date(start) };
            } else if (end) {
                searchCriteria.updatedAt = { $lt: new Date(end) };
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

        Diagnose.find(searchCriteria)
            .select('doctor user prescription updatedAt')
            .lean()
            .then((results) => res.json(results))
            .catch(err => next(err));
    },

    // 化验单使用
    searchTestUsage: (req, res, next) => {
        const { doctor, start, end, hid } = req.body;
        let searchCriteria = {
            hid: hid,
            status: 3, // achived/finished
        };
        if (start || end) {
            if (start && end) {
                searchCriteria.updatedAt = { $gte: new Date(start), $lt: new Date(end) };
            } else if (start) {
                searchCriteria.updatedAt = { $gte: new Date(start) };
            } else if (end) {
                searchCriteria.updatedAt = { $lt: new Date(end) };
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

        Diagnose.find(searchCriteria)
            .select('doctor user labResults updatedAt')
            .populate('labResults.test')
            .lean()
            .then((results) => res.json(results))
            .catch(err => next(err));
    },


    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Diagnose.findOne({ _id: id })
            .populate({
                path: 'doctor',
                select: 'name title department',
                populate: {
                    path: 'department',
                    select: 'name -_id'
                }
            })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // 根据doctor id and patient ID获取当前的门诊
    GetByUserAndDoctor: (req, res, next) => {
        const { user, doctor } = req.params;
        Diagnose.findOne({ user: user, doctor: doctor, hid: req.token.hid, status: { $ne: 3 } })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获取药师当月门诊完成数
    GetCurrentMonthFinishedByDoctor: function (req, res) {

        if (req.params && req.params.doctor) {

            var firstDay = new moment(moment().format('YYYY-MM-01 00:00:00'));
            // var lastDay = firstDay.add(1, 'months').subtract(1, 'minutes');
            var lastDay = firstDay.clone().endOf('month');
            //console.log(lastDay);
            Diagnose.countDocuments({
                doctor: req.params.doctor,
                updatedAt: { $gte: firstDay, $lt: lastDay },
                status: 3
            })
                .exec(function (err, count) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    res.json(count);
                });
        }
    },
    // 获取药师当月门诊完成数
    GetCountsByDoctor: (req, res, next) => {
        const { doctor } = req.params;

        Diagnose.find({ doctor: doctor, hid: req.token.hid })
            .select('createdAt status')
            .lean()
            .then(results => res.json(results))
            .catch(err => next(err));
    },

    // 获取用户的门诊历史记录
    GetUserHistoryList: (req, res, next) => {
        const { user } = req.params;
        Diagnose.find({ user: user, hid: req.token.hid, status: 3 })
            .populate({
                path: 'doctor',
                select: 'name title department',
                populate: {
                    path: 'department',
                    select: 'name -_id'
                }
            })
            .sort({ updatedAt: -1 })
            .select('-hid -__v')
            .lean()
            .then(results => res.json(results))
            .catch(err => next(err));
    },

    // 获取用户最近一次的门诊(history)
    GetUserLatestDiagnose: (req, res, next) => {
        const { user } = req.params;
        Diagnose.find({ user: user, hid: req.token.hid, status: 3 })
            .populate({
                path: 'doctor',
                select: 'name title department',
                populate: {
                    path: 'department',
                    select: 'name -_id'
                }
            })
            .sort({ updatedAt: -1 })
            .limit(1)
            .select('-hid -__v')
            .then(results => {
                if (results && results.length > 0) {
                    res.json(results[0]);
                } else {
                    res.json(null);
                }
            })
            .catch(err => next(err));
    },

    // 创建 Diagnose
    Add: (req, res, next) => {
        const item = req.body;

        // doctor
        if (!item.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        // user
        if (!item.user) {
            return Status.returnStatus(res, Status.NO_USER);
        }
        Diagnose.create(item)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: function (req, res, next) {
        const { id } = req.params;
        Diagnose.findByIdAndUpdate(id, { ...req.body }, { new: true })
            .select('-hid -__v')
            .then((result) => {
                if (result && result.booking && result.status === 3) { // 3: archived
                    // close booking
                    Booking.findByIdAndUpdate(result.booking, { status: 5 }).exec(); // 5: finished
                }
                res.json(result);
            })
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Diagnose.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => {
                if (result && result.surveys && result.surveys.length) {
                    result.surveys.map(survey => {
                        if (survey.list && survey.list.length) {
                            survey.list.map(_ => {
                                Survey.deleteOne({ _id: _ }).exec();
                            });
                        }
                    })
                }
                res.json(result)
            })
            .catch(err => next(err));
    },

    GetAssessmentById: function (req, res) {

        if (req.params && req.params.id) {

            Diagnose.findOne({ _id: req.params.id }, 'assessment')
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.json(item.assessment);
                });
        }
    },

    UpdateAssessmentById: function (req, res) {
        if (req.params && req.params.id) { // params.id is ID

            // 获取数据（json）
            var diagnose = req.body;

            Diagnose.findOne({ _id: req.params.id }, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }


                item.assessment = diagnose.assessment;

                //
                item.save(function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    res.json(raw);
                });

            });

        }
    },

    GetAssessmentsByDoctor: function (req, res) {

        if (req.params && req.params.did) {

            Diagnose.find({ doctor: req.params.did, status: 3 }, '-_id doctor user assessment createdAt updatedAt')
                //.lean()
                .populate('user', '-_id name')
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

    GetDiagnoseCountsByDoctor: function (req, res) {

        if (req.params && req.params.did) {

            Diagnose.find({ doctor: req.params.did })
                .exec(function (err, items) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!items) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    var finishedCount = 0, unfinishedCount = 0;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].status >= 3) {
                            finishedCount++;
                        }
                        else {
                            unfinishedCount++;
                        }
                    }

                    res.json({
                        finishedCount: finishedCount,
                        unfinishedCount: unfinishedCount
                    });
                });
        }
    },

}