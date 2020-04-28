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
  Add: function (req, res) {

    // 获取department请求数据（json）
    const department = req.body;

    // name
    if (!department.name) {
      return Status.returnStatus(res, Status.NO_NAME);
    }

    Department.find({ name: department.name }) // check if existed
      .exec(function (err, items) {
        if (err) {
          return Status.returnStatus(res, Status.ERROR, err);
        }

        if (items && items.length > 0) {
          return Status.returnStatus(res, Status.EXISTED);
        }

        Department.create({
          hid: department.hid,
          name: department.name,
          desc: department.desc,
          order: department.order,
          assetFolder: department.assetFolder,
          apply: department.apply
        }, function (err, raw) {
          if (err) {
            return Status.returnStatus(res, Status.ERROR, err);
          }

          return res.send(raw);
        });

      });
  },

  UpdateById: function (req, res) {
    // 获取user数据（json）
    var department = req.body;

    // params.id is doctor's user ID
    Department.findById(req.params.id, function (err, item) {
      if (err) {
        return Status.returnStatus(res, Status.ERROR, err);
      }

      if (!item) {
        return Status.returnStatus(res, Status.NULL);
      }

      if (department.name)
        item.name = department.name;
      if (department.desc)
        item.desc = department.desc;
      if (department.order)
        item.order = department.order;
      if (department.assetFolder || department.assetFolder == '')
        item.assetFolder = department.assetFolder;
      if (department.apply || department.apply === false)
        item.apply = department.apply;

      //
      item.save(function (err, raw) {
        if (err) {
          return Status.returnStatus(res, Status.ERROR, err);
        }
        res.json(raw);
      });

    });
  },

  DeleteById: function (req, res) {
    if (req.params && req.params.id) { // params.id is doctor's user ID
      var id = req.params.id;

      Department.findById(id, function (err, item) {
        if (err) {
          return Status.returnStatus(res, Status.ERROR, err);
        }

        if (!item) {
          return Status.returnStatus(res, Status.NULL);
        }

        item.remove(function (err, raw) {
          if (err) {
            return Status.returnStatus(res, Status.ERROR, err);
          }

          res.json(raw);
        });

      });
    }
  },

}