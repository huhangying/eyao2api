/**
 * Created by hhu on 2016/5/20.
 */
var Group = require('../model/group.js');
var Relationship = require('../model/relationship.js');

module.exports = {

    //
    GetAll: (req, res, next) => {
        Group.find({ hid: req.token.hid })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    //
    GetAllPopulated: (req, res, next) => {
        Group.find({ hid: req.token.hid })
            .populate('doctor')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Group.findOne({ _id: id, apply: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据医生ID 获取相关的关系组
    GetByDoctorId: (req, res, next) => {
        const { id } = req.params; // id is doctor id
        Group.findOne({ doctor: id, apply: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // 创建关系组
    FindOrAdd: (req, res, next) => {
        const group = req.body;
        // name
        if (!group.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // doctor
        if (!group.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        Group.findOne({ name: group.name, doctor: group.doctor, hid: group.hid }) // check if existed
            .then((result) => {
                // 如果存在，直接返回
                if (result) return Status.returnStatus(res, Status.EXISTED);

                Group.create(group)
                    .then((result) => res.json(result))
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    },

    UpdateById: function (req, res) {
        const { id } = req.params;// params.id is group ID

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

            if (group.doctor)
                item.doctor = group.doctor;
            if (group.name) {
                item.name = group.name;
            }
            if (group.apply || group.apply === false)
                item.apply = group.apply;

            // 如果group name 没有变,或者group name不需要更新,则不用check duplicated group name
            if (group_name == item.name || !group.name) {
                item.save(function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    return res.json(raw);
                });
            }

            // check if duplication group name in a doctor
            Group.find({ name: group.name, doctor: group.doctor }) // check if existed
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

    },


    DeleteById: (req, res, next) => {
        const { id } = req.params;// params.id is group ID
        Group.findByIdAndDelete(id)
            .then((result) => {
                if (result) {
                    // remove the related-group relationship (set group_ids to null)
                    Relationship.update({ group: id }, { $set: { group: undefined } }, { multi: true }).exec();
                }
                return res.json(result)
            })
            .catch(err => next(err));
    },

}