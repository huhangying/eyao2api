const Order = require('../model/order.js');

module.exports = {

    GetAll: (req, res, next) => {

        Order.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Order.findById(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建
    Update: (req, res, next) => {
        const item = req.body;
        // user
        if (!item.openid) {
            return Status.returnStatus(res, Status.NO_USER);
        }

        // order id
        if (!item.out_trade_no) {
            return Status.returnStatus(res, Status.NO_ORDERID);
        }

        Order.findOneAndUpdate(
            { out_trade_no: item.out_trade_no, openid: item.openid, hid: item.hid },
            item,
            { upsert: true, new: true }
        )
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Order.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    //===============================================
    // Functions
    //===============================================

    updateOrder: (openid, out_trade_no, data) => {
        return Order.findOneAndUpdate(
            { out_trade_no: out_trade_no, openid: openid },
            data,
            { upsert: true, new: true }
        );
    }

}