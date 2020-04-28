/**
 * Created by hhu on 2016/5/9.
 */

var Department = require('../model/department.js');

module.exports = {


  GetAll: (req, res, next) => {

    Department.find({ hid: req.token.hid })
      .sort({ order: 1 })
      .exec((err, result) => err ? next(err) : res.json(result));
  },

  // 根据ID获取详细信息
  GetById: (req, res, next) => {

    const { id } = req.params;
    Department.findOne({ _id: id })
      .exec((err, result) => err ? next(err) : res.json(result));
  },


  // 创建医院科室
  Add: (req, res, next) => {
    const department = req.body;
    // name
    if (!department.name) {
      return Status.returnStatus(res, Status.NO_NAME);
    }
    Department.findOne({ name: department.name, hid: department.hid }) // check if existed
      .exec((err, result) => {
        if (err) return next(err);
        if (result) return Status.returnStatus(res, Status.EXISTED);

        Department.create(department,
          (err, result) => err ? next(err) : res.json(result)
        );
      });

  },

  UpdateById: function (req, res, next) {

    const { id } = req.params;
    Department.findByIdAndUpdate(id, { ...req.body }, { new: true })
      .exec((err, result) => err ? next(err) : res.json(result));
  },

  DeleteById: function (req, res, next) {
    // params.id is doctor's user ID
    const { id } = req.params;
    Department.findByIdAndDelete(id)
      .exec((err, result) => err ? next(err) : res.json(result));
  },

}