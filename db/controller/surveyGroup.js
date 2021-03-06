/**
 * Created by harry on 16/6/30.
 */

 // no use. to remove

var SurveyGroup = require('../model/surveyGroup.js');

module.exports = {

    GetAll: function (req, res) {

        SurveyGroup.find()
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

            SurveyGroup.findOne({_id: req.params.id})
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

    // 根据 department & type 获取Survey group list
    GetSurveyGroupsByType: function (req, res) {

        if (req.params && req.params.department && req.params.type) {

            SurveyGroup.find({department: req.params.department, type: req.params.type})
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
        var item = req.body;

        // name
        if (!item.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }

        // survey group ? allow to create a survey group without survey?

        // 不存在，创建
        SurveyGroup.create({
            hid: item.hid,
            department: item.department,
            type: item.type,
            name: item.name,
            desc: item.desc,
            order: item.order
        }, function (err, raw) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            return res.send(raw);
        });

    },

    UpdateById: function (req, res) {
        if (req.params && req.params.id) { // params.id is group ID
            var id = req.params.id;

            // 获取数据（json）
            var surveyGroup = req.body;

            SurveyGroup.findById(id, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }
                if (surveyGroup.department)
                    item.department = surveyGroup.department;
                if (surveyGroup.type)
                    item.type = surveyGroup.type;
                if (surveyGroup.name)
                    item.name = surveyGroup.name;
                if (surveyGroup.desc)
                    item.desc = surveyGroup.desc;
                if (surveyGroup.order || surveyGroup.order == 0)
                    item.order = surveyGroup.order;
                if (surveyGroup.apply || surveyGroup.apply === false)
                    item.apply = surveyGroup.apply;


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

            SurveyGroup.findOne({_id: req.params.id}, function (err, item) {
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