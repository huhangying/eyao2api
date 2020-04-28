/**
 * Created by hhu on 2016/5/9.
 */

const Department = require('../model/department.js');

module.exports = {

  GetAll: (req, res, next) => {

    Department.find({ hid: req.token.hid })
      .sort({ order: 1 })
      .lean()
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // 根据ID获取详细信息
  GetById: (req, res, next) => {
    const { id } = req.params;
    Department.findOne({ _id: id })
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
    Department.findOne({ name: department.name, hid: department.hid }) // check if existed
      .then((result) => {
        if (result) return Status.returnStatus(res, Status.EXISTED);

        Department.create(department)
        .then((result) => res.json(result))
        .catch(err => next(err));
      })
      .catch(err => next(err));
  },

  UpdateById: function (req, res, next) {
    const { id } = req.params;
    Department.findByIdAndUpdate(id, { ...req.body }, { new: true })
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  DeleteById: function (req, res, next) {
    // params.id is doctor's user ID
    const { id } = req.params;
    Department.findByIdAndDelete(id)
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

}