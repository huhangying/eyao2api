/**
 * Created by hhu on 2016/5/20.
 */
var Relationship = require('../model/relationship.js');

module.exports = {

    GetAll: (req, res, next) => {
        Relationship.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;

        Relationship.findById(id)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据医生ID 和 病患ID，判断relationship是否存在
    CheckIfRelationshipExisted: (req, res, next) => {
        const { did, uid } = req.params;
        Relationship.findOne({ doctor: did, user: uid, hid: req.token.hid, apply: true })
            .then(result => res.json({ existed: !!result }))
            .catch(err => next(err));
    },

    // 根据医生ID 获取相关的关系组
    GetByDoctorId: (req, res, next) => {
        const { id } = req.params; // id is doctor id
        Relationship.find({ doctor: id, hid: req.token.hid, apply: true })
            .select('-hid -__v')
            .populate('user', 'name _id cell gender birthdate')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    // 根据医生ID 获取相关的关系组
    // 返回用户组和用户信息: [group name, group id,] user name, user id
    GetSelectionByDoctorId: (req, res, next) => {
        const { id } = req.params;
        Relationship.find({ doctor: id, hid: req.token.hid, apply: true })
            .select('-hid -__v')
            .sort({ group: -1 })
            .populate('user', 'link_id name _id')
            .populate('group', 'name _id')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据医生ID 获取相关的关系组
    // 返回用户详细信息: [user name, cell, gender, birthdate, role]
    GetUserDetailsByDoctorId: function (req, res) {
        const { id } = req.params; // id is doctor id
        Relationship.find({ doctor: id, apply: true })//, 'user -_id')
            // .populate('user', 'name cell gender birthdate role created -_id')
            // .sort({'user.created': 1})
            .populate({
                path: 'user',
                select: 'name cell gender birthdate role created -_id'
            })
            .sort({ 'user.created': 1 })
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

    // 根据患者ID 获取医患关系
    GetByUserId: (req, res, next) => {
        const { id } = req.params; // id is patient user id

        Relationship.find({ user: id, hid: req.token.hid, apply: true })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据Group ID 获取医患关系
    GetByGroupId: (req, res, next) => {
        const { group } = req.params;

        Relationship.find({ group: group, hid: req.token.hid, apply: true })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建医患关系
    // ? This one is weird. The relationship should only be updated but not added.
    FindOrAdd: function (req, res) {
        const relationship = req.body;

        // check doctor, user
        if (!relationship.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        if (!relationship.user) {
            return Status.returnStatus(res, Status.NO_USER);
        }

        Relationship.find({ doctor: relationship.doctor, user: relationship.user, hid: relationship.hid, apply: true }) // check if existed
            .exec(function (err, items) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                // 一个患者能被加到多个组中
                if (items) {

                    var found = false;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].group == relationship.group) {
                            found = true;
                            break;
                        }
                    }

                    // 如果存在，直接返回
                    if (found) {
                        return res.json(items);
                    }

                }

                // 不存在，创建
                Relationship.create({
                    hid: relationship.hid,
                    user: relationship.user,
                    doctor: relationship.doctor,
                    group: relationship.group
                }, function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    return res.send(raw);
                });

            });
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const relationship = req.body; // body should only include group

        Relationship.findByIdAndUpdate(id, relationship, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));

        // const { id } = req.params;
        // // 获取数据（json）,只能更新关系组名
        // const relationship = req.body;

        // Relationship.findById(id, function (err, item) {
        //     if (err) {
        //         return Status.returnStatus(res, Status.ERROR, err);
        //     }

        //     if (!item) {
        //         return Status.returnStatus(res, Status.NULL);
        //     }

        //     if (relationship.doctor)
        //         item.doctor = relationship.doctor;
        //     if (relationship.group) {
        //         if (relationship.group == '0000') {
        //             item.group = null;
        //         }
        //         else
        //             item.group = relationship.group;
        //     }

        //     if (relationship.user)
        //         item.user = relationship.user;
        //     if (relationship.apply || relationship.apply === false)
        //         item.apply = relationship.apply;

        //     item.save(function (err, raw) {
        //         if (err) {
        //             return Status.returnStatus(res, Status.ERROR, err);
        //         }
        //         res.json(raw);
        //     });

        // });
    },


    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Relationship.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // should not be used!!!
    DeleteByUserId: (req, res, next) => {
        const { id } = req.params; // id is user ID
        Relationship.remove({ user: id, hid: req.token.hid })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // should not be used!!!
    DeleteByDoctorId: (req, res, next) => {
        const { id } = req.params; // id is doctor ID
        Relationship.remove({ doctor: id, hid: req.token.hid })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}