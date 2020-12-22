/**
 * Created by harry on 16/9/13.
 */

var Survey = require('../model/survey.js');
const moment = require('moment');

module.exports = {

    GetAll: (req, res, next) => {
        Survey.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    search: (req, res, next) => {
        const {department, doctor, start, end, hid} = req.body;
        const searchCriteria = {
            department: department || undefined,
            doctor: doctor || undefined,
            hid: hid            
        }
        Survey.find(searchCriteria)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Survey.findById(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 doctor & type & user 获取Survey list
    GetSurveysByUserType: (req, res, next) => {
        const { user, doctor, type, readonly } = req.params;

        var searchCriteria = {
            user: user,
            doctor: doctor,
            type: type,
            hid: req.token.hid,
            finished: readonly == 1
        };
        if (readonly != 1) {
            searchCriteria.availableBy = { $gt: new Date() };
        }

        Survey.find(searchCriteria)
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 doctor & type & user and list to retrieve details
    GetSurveysByUserTypeAndList: (req, res, next) => {

        const searchCriteria = {
            user: req.params.user,
            doctor: req.params.doctor,
            type: req.params.type,
            hid: req.token.hid,
            finished: req.params.readonly == 1
        };
        if (req.params.readonly != 1) {
            searchCriteria.availableBy = { $gt: new Date() };
        }

        Survey.find(searchCriteria)
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then(items => {
                if (items.length && req.params.list) {
                    const surveyList = req.params.list.split('|');
                    items = items.filter(item => {
                        return surveyList.indexOf(item._id.toString()) > -1;
                    });
                }
                res.json(items)
            })
            .catch(err => next(err));
    },

    // 根据 doctor & type & user and list to retrieve details (包括完成和未完成)
    GetAllSurveysByUserTypeAndList: (req, res, next) => {

        const searchCriteria = {
            user: req.params.user,
            doctor: req.params.doctor,
            type: req.params.type,
            hid: req.token.hid,
        };

        Survey.find(searchCriteria)
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then(items => {
                if (items.length && req.params.list) {
                    const surveyList = req.params.list.split('|');
                    items = items.filter(item => {
                        return surveyList.indexOf(item._id.toString()) > -1;
                    });
                }
                res.json(items)
            })
            .catch(err => next(err));
    },

    // 获取 user 的未完成 surveys
    GetMySurveys: (req, res, next) => {
        const { user } = req.params;

        const searchCriteria = {
            user: user,
            hid: req.token.hid,
            type: { $gt: 0, $lt: 5 },
            availableBy: { $gt: new Date() },
            finished: false
        };

        Survey.find(searchCriteria)
            .populate({ path: 'doctor', select: 'name title department' })
            .sort({ updatedAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获取 user 的未完成 survey
    GetMySurveysStart: (req, res, next) => {
        const { user, doctor, type, date } = req.params;

        const searchCriteria = {
            user: user,
            doctor: doctor,
            hid: req.token.hid,
            type: type,
            createdAt: {
                $gt: moment(date).startOf('day').toDate(),
                $lt: moment(date).endOf('day').toDate()
            },
            availableBy: { $gt: new Date() },
            finished: false
        };

        Survey.find(searchCriteria)
            .populate({ path: 'doctor', select: 'name title department' })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据Department ID获取Survey list
    GetSurveysByDepartmentId: (req, res, next) => {
        const { did } = req.params; // did is department id
        Survey.find({ department: did, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 关闭所有该药师和该用户相关的surveys（set finished=true for type in [1,2,5]）
    CloseAllRelativeSurveys: (req, res, next) => {
        const { doctor, user } = req.params;

        Survey.updateMany(
            {
                user: user,
                doctor: doctor,
                hid: req.body.hid,
                finished: false,
                type: { $in: [1, 2, 5] }

            },
            {
                $set: {
                    finished: true
                }
            },
            {
                multi: true
            })
            .then((result) => res.json(result))
            .catch(err => next(err));

    },

    // 创建
    Add: (req, res, next) => {
        const survey = req.body;

        // doctor
        if (!survey.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        // user
        if (!survey.user) {
            return Status.returnStatus(res, Status.NO_USER);
        }
        // name
        if (!survey.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // department
        if (!survey.department) {
            return Status.returnStatus(res, Status.NO_DEPARTMENT);
        }
        // type
        if (!survey.type) {
            return Status.returnStatus(res, Status.NO_TYPE);
        }
        // questions ? allow to create a survey without questions?

        // 不存在，创建
        Survey.create(survey)
            .then((result) => res.json(result))
            .catch(err => next(err));

    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const survey = req.body;

        Survey.findByIdAndUpdate(id, survey, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Survey.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}