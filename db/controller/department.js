/**
 * Created by hhu on 2016/5/9.
 */

const Department = require('../model/department');
const Doctor = require('../model/doctor');
const ArticleTemplate = require('../model/articleTemplate');
const AdverseReaction = require('../model/adverseReaction');
const SurveyTemplate = require('../model/surveyTemplate');
const SurveyCat = require('../model/surveyCat');

const self = module.exports = {

  GetAll: (req, res, next) => {

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

  UpdateById: function (req, res, next) {
    const { id } = req.params;
    Department.findByIdAndUpdate(id, { ...req.body }, { new: true })
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  DeleteById: async (req, res, next) => {
    // params.id is doctor's user ID
    const { id } = req.params;

    const allow = await self.allowToDelete(id, req.token.hid);
    if (!allow) {
      return Status.returnStatus(res, Status.DELETE_NOT_ALLOWED)
    }

    Department.findByIdAndDelete(id)
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // functions for delete
  allowToDelete: async (id, hid) => {
    let existed = true;
    try {
      existed = await Doctor.exists({ department: id, hid: hid })
      if (existed) return false;

      existed = await ArticleTemplate.exists({ department: id, hid: hid })
      if (existed) return false;

      existed = await AdverseReaction.exists({ department: id, hid: hid })
      if (existed) return false;

      existed = await SurveyTemplate.exists({ department: id, hid: hid })
      if (existed) return false;

      existed = await SurveyCat.exists({ department: id, hid: hid })
      if (existed) return false;
    } catch (e) {
      return false;
    }

    return true;
  },

}