/**
 * Created by harry on 16/6/30.
 */

var Period = require('../model/period.js');

module.exports = {

    GetAll: (req, res, next) => {
        Period.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;

        Period.findById(id)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建关系组
    Add: function (req, res) {

        // 获取请求数据（json）
        var period = req.body;

        // name
        if (!period.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // from
        if (!period.from) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        // 不存在，创建
        Period.create({
            hid: period.hid,
            name: period.name,
            from: period.from,
            to: period.to
        }, function (err, raw) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            return res.send(raw);
        });

    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const period = req.body;
        Period.findByIdAndUpdate(id, period, { new: true })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },


    DeleteById:  (req, res, next) => {
        const { id } = req.params;
        Period.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    }

}