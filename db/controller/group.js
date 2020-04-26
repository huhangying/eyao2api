/**
 * Created by hhu on 2016/5/20.
 */
var Group = require('../model/group.js');
var Relationship = require('../model/relationship.js');

module.exports = {

    GetAll: function (req, res) {
      var query = {};
      if (req.query.hid) {
        query.hid = req.query.hid;
      }
        Group.find(query)
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

    GetAllPopulated: function (req, res) {
      var query = {};
      if (req.query.hid) {
        query.hid = req.query.hid;
      }
        Group.find(query)
            .populate('doctor')
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

            Group.findOne({_id: req.params.id, apply: true})
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

    // 根据医生ID 获取相关的关系组
    GetByDoctorId: function (req, res) {

        if (req.params && req.params.id) {

            Group.find({doctor: req.params.id, apply: true})
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
    FindOrAdd: function (req, res) {

        // 获取请求数据（json）
        var group = req.body;

        // name
        if (!group.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // doctor
        if (!group.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }

        Group.findOne({name: group.name, doctor: group.doctor}) // check if existed
            .exec(function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                // 如果存在，直接返回
                if (item) {
                    return Status.returnStatus(res, Status.EXISTED_NAME);
                }

                // 不存在，创建
                Group.create({

                  hid: group.hid,
                    name: group.name,
                    doctor: group.doctor,
                    apply: group.apply || true
                }, function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    return res.send(raw);
                });

            });
    },

    UpdateById: function (req, res) {
        if (req.params && req.params.id) { // params.id is group ID
            var id = req.params.id;

            // 获取数据（json）,只能更新关系组名
            var group = req.body;
            var group_name;

            Group.findById(id, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }
                group_name = item.name; // 原id的group name

              if (group.hid) {
                item.hid = group.hid;
              }
                if (group.doctor)
                    item.doctor = group.doctor;
                if (group.name){
                    item.name = group.name;
                }
                if (group.apply || group.apply === false)
                    item.apply = group.apply;


                //console.log(JSON.stringify(item));

                // 如果group name 没有变,或者group name不需要更新,则不用check duplicated group name
                if (group_name == item.name || !group.name){
                    item.save(function (err, raw) {
                        if (err) {
                            return Status.returnStatus(res, Status.ERROR, err);
                        }
                        return res.json(raw);
                    });
                }

                // check if duplication group name in a doctor
                Group.find({name: group.name, doctor: group.doctor}) // check if existed
                    .exec(function (err, items) {
                        if (err) {
                            return Status.returnStatus(res, Status.ERROR, err);
                        }

                        // 如果存在，直接返回
                        if (items && items.length > 0 && items[0].name != group_name) {
                            return Status.returnStatus(res, Status.EXISTED_NAME);
                        }

                        item.save(function (err, raw) {
                            if (err) {
                                return Status.returnStatus(res, Status.ERROR, err);
                            }
                            res.json(raw);
                        });
                    });
            });
        }
    },


    DeleteById: function (req, res) {
        if (req.params && req.params.id) { // params.id is group ID

            var group_id = req.params.id;
            Group.findOne({_id: group_id}, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item){
                    return Status.returnStatus(res, Status.NULL);
                }

                // remove the related-group relationship (set group_ids to null)
                Relationship.update({group: group_id}, { $set: {group: undefined}}, { multi: true } ).exec();

                // delete group
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