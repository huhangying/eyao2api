/**
 * Created by harry on 16/9/13.
 */

var SurveyTemplate = require('../model/surveyTemplate.js');

module.exports = {

    GetAll: (req, res, next) => {
        SurveyTemplate.find({ hid: req.token.hid })
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        SurveyTemplate.findById(id)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 department & type 获取Survey template list
    GetSurveyTemplatesByType: (req, res, next) => {
        const { department, type } = req.params;
        const query = {
            department: department,
            type: type,
            hid: req.token.hid
        };
        SurveyTemplate.find(query)
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 department & type & list 获取Survey template list
    GetSurveyTemplatesByTypeAndList: function (req, res) {

        if (req.params && req.params.department && req.params.type && req.params.list) {
            var searchCriteria = {
                department: req.params.department,
                type: req.params.type
            };

            SurveyTemplate.find(searchCriteria)
                .sort({ order: 1 })
                .exec(function (err, items) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!items || items.length < 1) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    var surveyTemplateList = req.params.list.split('|');

                    items = items.filter(function (item) {
                        return surveyTemplateList.indexOf(item._id.toString()) > -1;
                    });
                    res.json(items);
                });
        }
    },

    // 根据 Department ID 获取 Survey template list
    GetSurveyTemplatesByDepartmentId: (req, res, next) => {
        const { did } = req.params; // did is department
        SurveyTemplate.find({ department: did, hid: req.token.hid })
            .sort({ order: 1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建关系组
    Add: function (req, res) {

        // 获取请求数据（json）
        var item = req.body;

        // name
        if (!item.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // department
        if (!item.department) {
            return Status.returnStatus(res, Status.NO_DEPARTMENT);
        }
        // type
        if (!item.type) {
            return Status.returnStatus(res, Status.NO_TYPE);
        }
        // questions ? allow to create a survey without questions?

        // 不存在，创建
        SurveyTemplate.create({
            hid: item.hid,
            name: item.name,
            department: item.department,
            type: item.type,
            //group: template.group,
            questions: item.questions,
            availableDays: item.availableDays,
            order: item.order
        }, function (err, raw) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            return res.send(raw);
        });

    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const template = req.body;
        SurveyTemplate.findByIdAndUpdate(id, template, { new: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        SurveyTemplate.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}