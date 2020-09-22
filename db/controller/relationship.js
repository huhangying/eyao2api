/**
 * Created by hhu on 2016/5/20.
 */
var Relationship = require('../model/relationship.js');
const Schedule = require('../controller/schedule');
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

    // 根据医生ID 获取相关的病患
    GetByDoctorId: (req, res, next) => {
        const { id } = req.params; // id is doctor id
        Relationship.find({ doctor: id, hid: req.token.hid, apply: true })
            .select('-hid -__v')
            .populate('user', 'name _id cell gender birthdate icon')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据医生ID 获取病患数
    GetCountByDoctorId: (req, res, next) => {
        const { id } = req.params; // id is doctor id
        Relationship.count({ doctor: id, hid: req.token.hid, apply: true })
            .then((count) => res.json({ total: count }))
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

    // 微信
    // 根据患者ID 获取关联医生的详细信息
    GetFocusDoctorsByUser: (req, res, next) => {
        const { id } = req.params; // id is patient user id
        Relationship.find({ user: id, hid: req.token.hid, apply: true })
            .select('doctor')
            .populate({
                path: 'doctor',
                populate: { path: 'department', select: '_id name' },
                select: '_id name department title bulletin expertise gender honor hours icon status prices',
            })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 微信
    // 根据患者ID 获取有门诊的关联医生的详细信息
    GetScheduleDoctorsByUser: (req, res, next) => {
        const { id } = req.params; // id is patient user id
        Relationship.find({ user: id, hid: req.token.hid, apply: true })
            .select('doctor apply')
            .populate({
                path: 'doctor',
                populate: { path: 'department', select: '_id name' },
                select: '_id name department title bulletin expertise gender honor hours icon status',
            })
            .lean()
            .then((results) => {
                const promises = results.map(rel => {
                    return Schedule.checkDoctorHasSchedules(rel.doctor, req.token.hid)
                        .then(_ => {
                            rel.apply = _;
                            return rel;
                        });
                });
                Promise.all(promises)
                    .then((results) => res.json(results))
            })
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
    // support one-user to multiple-groups
    FindOrAdd: (req, res, next) => {
        const relationship = req.body;

        // check doctor, user
        if (!relationship.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        if (!relationship.user) {
            return Status.returnStatus(res, Status.NO_USER);
        }

        // check if existed
        Relationship.find({
            doctor: relationship.doctor,
            user: relationship.user,
            hid: relationship.hid,
            apply: true
        })
            .select('-hid -__v')
            .lean()
            .then(async items => {
                // 一个患者能被加到多个组中
                if (items) {
                    const found = items.find(_ => _.group === relationship.group);
                    if (found) {
                        return res.json(found);
                    }

                    // 如果有空的 relationship，加到里面
                    const foundEmptyOne = items.find(_ => !_.group);
                    if (foundEmptyOne) {
                        foundEmptyOne.group = relationship.group;
                        const updatedOne = await foundEmptyOne.save();
                        return res.json(updatedOne);
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
            })
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const relationship = req.body; // body should only include group

        if (relationship.group) {
            Relationship.findByIdAndUpdate(id, relationship, { new: true })
                .select('-hid -__v')
                .then((result) => res.json(result))
                .catch(err => next(err));
        } else {
            Relationship.findById(id).then(result => {
                if (!result) {
                    return Status.returnStatus(res, Status.NOT_EXISTED);
                }
                //
                Relationship.count({ doctor: result.doctor, user: result.user, hid: result.hid, apply: true })
                    .then(numb => {
                        if (numb > 1) {
                            // 如果已经有2个relationship，删除自己
                            Relationship.findByIdAndDelete(id)
                                .select('-hid -__v')
                                .then((result) => res.json(result))
                                .catch(err => next(err));

                        } else {
                            // 如果 == 1(self), do update
                            Relationship.findByIdAndUpdate(id, relationship, { new: true })
                                .select('-hid -__v')
                                .then((result) => res.json(result))
                                .catch(err => next(err));
                            return res.json(result);
                        }
                    })

            })
                .catch(err => next(err));
        }
    },

    // ? no-use. following is not working anyway.
    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Relationship.findById(id).then(result => {
            if (!result) {
                return Status.returnStatus(res, Status.NOT_EXISTED);
            }
            if (result.group) {
                Relationship.count({ doctor: result.doctor, user: result.user, group: null, hid: result.hid, apply: true })
                    .then(numb => {
                        if (numb > 0) {
                            // 如果已经有空relationship，删除自己
                            Relationship.findByIdAndDelete(id)
                                .select('-hid -__v')
                                .then((result) => res.json(result))
                                .catch(err => next(err));

                        } else {
                            // 没有空relationship，把自己变成空relationship
                            result.group = null;
                            result.save();
                            return res.json(result);
                        }
                    })
            } else {
                //
                Relationship.count({ doctor: result.doctor, user: result.user, group: null, hid: result.hid, apply: true })
                    .then(numb => {
                        if (numb > 1) {
                            // 如果已经有2个空relationship，删除自己
                            Relationship.findByIdAndDelete(id)
                                .select('-hid -__v')
                                .then((result) => res.json(result))
                                .catch(err => next(err));

                        } else {
                            // 如果< 2 空relationship，do nothing
                            return res.json(result);
                        }
                    })
            }
        })
            .catch(err => next(err));
    },

    RemoveRelationship: (req, res, next) => {
        const { did, uid } = req.params;
        Relationship.deleteMany({ user: uid, doctor: did, hid: req.token.hid })
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