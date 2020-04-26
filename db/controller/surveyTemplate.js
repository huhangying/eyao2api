/**
 * Created by harry on 16/9/13.
 */

var SurveyTemplate = require('../model/surveyTemplate.js');

module.exports = {

    GetAll: function (req, res) {

        SurveyTemplate.find()
            .exec(function (err, items) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!items || items.length < 1) {
                    return Status.returnStatus(res, Status.NULL);
                }

                res.json(items);
            });
    },

    // 根据ID获取详细信息
    GetById: function (req, res) {

        if (req.params && req.params.id) {

            SurveyTemplate.findOne({_id: req.params.id})
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

    // 根据 department & type 获取Survey template list
    GetSurveyTemplatesByType: function (req, res) {

        if (req.params && req.params.department && req.params.type) {
            var searchCriteria = {department: req.params.department, type: req.params.type};

            SurveyTemplate.find(searchCriteria)
                .sort({order: 1})
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

    // 根据 department & type & list 获取Survey template list
            GetSurveyTemplatesByTypeAndList: function (req, res) {

        if (req.params && req.params.department && req.params.type && req.params.list) {
            var searchCriteria = {
                department: req.params.department,
                type: req.params.type
            };

            SurveyTemplate.find(searchCriteria)
                .sort({order: 1})
                .exec(function (err, items) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!items || items.length < 1) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    var surveyTemplateList = req.params.list.split('|');

                    items = items.filter(function(item) {
                        return surveyTemplateList.indexOf(item._id.toString()) > -1;
                    });
                    res.json(items);
                });
        }
    },

    // 根据 Department ID 获取 Survey template list
    GetSurveyTemplatesByDepartmentId: function (req, res) {

        if (req.params && req.params.did) {

            SurveyTemplate.find({department: req.params.did})
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
            return Status.returnStatus(res, Status.MISSING_PARAM);
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

    UpdateById: function (req, res) {
        if (req.params && req.params.id) { // params.id is ID
            var id = req.params.id;

            // 获取数据（json）
            var template = req.body;

            SurveyTemplate.findById(id, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }

                if (template.name)
                    item.name = template.name;
                if (template.department)
                    item.department = template.department;
                if (template.type)
                    item.type = template.type;
                // if (template.group)
                //     item.group = template.group;
                if (template.questions && template.questions.length > 0)
                    item.questions = template.questions;
                if (template.order)
                    item.order = template.order;
                if (template.availableDays)
                    item.availableDays = template.availableDays;
                if (template.apply || template.apply === false)
                    item.apply = template.apply;

                //console.log(JSON.stringify(item));

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


    DeleteById: function (req, res) {
        if (req.params && req.params.id) { // params.id is group ID

            SurveyTemplate.findOne({_id: req.params.id}, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item){
                    return Status.returnStatus(res, Status.NULL);
                }

                //
                item.remove(function(err, raw){
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    res.json(raw);
                });

            });
        }
    },

}