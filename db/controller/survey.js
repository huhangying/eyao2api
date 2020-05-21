/**
 * Created by harry on 16/9/13.
 */

var Survey = require('../model/survey.js');

module.exports = {

    GetAll: (req, res, next) => {
        Survey.find({ hid: req.token.hid })
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
    CloseAllRelativeSurveys: function (req, res) {

        if (req.params && req.params.doctor && req.params.user) {

            Survey.update(
                {
                    user: req.params.user,
                    doctor: req.params.doctor,
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

    // 创建
    Add: function (req, res) {

        // 获取请求数据（json）
        var survey = req.body;

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
        // group
        // if (!survey.group) {
        //     return Status.returnStatus(res, Status.NO_GROUP);
        // }

        // questions ? allow to create a survey without questions?



        // 不存在，创建
        Survey.create({
            hid: survey.hid,
            doctor: survey.doctor,
            user: survey.user,
            surveyTemplate: survey.surveyTemplate,

            name: survey.name,
            department: survey.department,
            type: survey.type,
            //group: survey.group,
            order: survey.order,
            availableBy: survey.availableBy,
            questions: survey.questions
        }, function (err, raw) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            return res.send(raw);
        });

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