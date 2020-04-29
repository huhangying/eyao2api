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

    UpdateById: (req, res, next) => {
        const { id } = req.params;// params.id is group ID

        // 获取数据（json）,只能更新关系组名
        const group = { ...req.body };
        Group.findByIdAndUpdate(id, group, { new: true })
          .then((result) => res.json(result))
          .catch(err => next(err));
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