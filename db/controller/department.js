/**
 * Created by hhu on 2016/5/9.
 */

const Department = require('../model/department');
const { allowToDeleteDepartment } = require('../../util/allow-to');

module.exports = {

  GetAll: (req, res, next) => {

    Department.find({ hid: req.token.hid, apply: true })
      .sort({ order: 1 })
      .select('-hid -__v')
      .lean()
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  GetCmsAll: (req, res, next) => {

    Department.find({ hid: req.token.hid })
      .sort({ order: 1 })
      .select('-hid -__v')
      .lean()
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // 根据ID获取详细信息
  GetById: (req, res, next) => {
    const { id } = req.params;
    Department.findOne({ _id: id })
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },


  // 创建医院科室
  Add: (req, res, next) => {
    const department = req.body;
    // name
    if (!department.name) {
      return Status.returnStatus(res, Status.NO_NAME);
    }
    Department.exists({ name: department.name, hid: department.hid }) // check if existed
      .then(result => {
        if (result) return Status.returnStatus(res, Status.EXISTED);

        Department.create(department)
          .then((result) => res.json(result))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  },

  UpdateById: (req, res, next) => {
    const { id } = req.params;
    Department.findByIdAndUpdate(id, { ...req.body }, { new: true })
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  DeleteById: async (req, res, next) => {
    // params.id is doctor's user ID
    const { id } = req.params;

    const allow = await allowToDeleteDepartment(id, req.token.hid);
    if (!allow) {
      return Status.returnStatus(res, Status.DELETE_NOT_ALLOWED)
    }

    Department.findByIdAndDelete(id)
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

}