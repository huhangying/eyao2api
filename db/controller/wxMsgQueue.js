const WxMsgQueue = require('../model/wxMsgQueue');

module.exports = {

    GetAll: (req, res, next) => {
        WxMsgQueue.find({ hid: req.token.hid })
            .sort({ createdAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    GetByDoctorId: (req, res, next) => {
        const {did} = req.params;
        WxMsgQueue.find({ doctorid: did, hid: req.token.hid })
            .sort({ createdAt: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        WxMsgQueue.findById(id)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        WxMsgQueue.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteByOpenid: (req, res, next) => {
        const { openid } = req.params;
        WxMsgQueue.deleteMany({openid: openid, hid: req.token.hid})
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}