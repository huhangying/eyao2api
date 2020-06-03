

const Faq = require('../model/faq.js');

module.exports = {

    // 返回所有有效的
    GetAll: (req, res, next) => {
        Faq.find({ hid: req.token.hid, apply: true })
            .select('question answer')
            .sort({ order: 1 })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    GetEditAll: (req, res, next) => {
        Faq.find({ hid: req.token.hid })
            .select('-hid -__v')
            .sort({ order: 1 })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建
    Add: (req, res, next) => {
        const faq = req.body;
        // question and answer
        if (!faq.question || !faq.answer) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }
        Faq.findOne({ question: faq.question, hid: faq.hid }) // check if existed
            .then((result) => {
                if (result) return Status.returnStatus(res, Status.EXISTED);

                Faq.create(faq)
                    .then((result) => res.json(result))
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    },

    // update
    UpdateById: (req, res, next) => {
        const { id } = req.params;
        const faq = { ...req.body };
        Faq.findByIdAndUpdate(id, faq, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Faq.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}