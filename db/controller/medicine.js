/**
 * Created by harry on 16/10/2.
 */
const Medicine = require('../model/medicine.js');

module.exports = {

    GetAll: (req, res, next) => {
        Medicine.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 获取所有药的列表, 用于 autoComplete 功能
    GetAllAvailable: (req, res, next) => {
        Medicine.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Medicine.findOne({ _id: id, apply: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建
    Add: (req, res, next) => {
        const medicine = req.body;
        // name
        if (!medicine.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // unit, dosage, category
        if (!medicine.unit || !medicine.usage || !medicine.capacity) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        Medicine.exists({ name: medicine.name, hid: medicine.hid }) // check if existed
        .then(result => {
          if (result) return Status.returnStatus(res, Status.EXISTED);
  
          Medicine.create(medicine)
            .then((result) => res.json(result))
            .catch(err => next(err));
        })
        .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const medicine = { ...req.body };
        Medicine.findByIdAndUpdate(id, medicine, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Medicine.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}