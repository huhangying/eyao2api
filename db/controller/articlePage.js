const ArticlePage = require('../model/articlePage');

module.exports = {

    GetAll: (req, res, next) => {

        ArticlePage.find({ hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    search: (req, res, next) => {
        const { doctor, start, end, hid } = req.body;
        let searchCriteria = {
            hid: hid,
        };
        if (start || end) {
            if (start && end) {
                searchCriteria.createdAt = { $gte: new Date(start), $lt: new Date(end) };
            } else if (start) {
                searchCriteria.createdAt = { $gte: new Date(start) };
            } else if (end) {
                searchCriteria.createdAt = { $lt: new Date(end) };
            }
        }
        if (doctor) {
            const doctors = doctor.split('|');
            if (doctors.length === 1) {
                searchCriteria.doctor = doctor;
            } else {
                searchCriteria.doctor = { $in: doctors };
            }
        }

        ArticlePage.find(searchCriteria)
            .select('doctor doctor_name cat name title createdAt')
            .populate('cat', 'name department')
            .lean()
            .then((results) => res.json(results))
            .catch(err => next(err));
    },

    // 根据ID获取详细信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        ArticlePage.findById(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据 doctor ID获取 article page list
    GetArticlePagesByDoctorId: (req, res, next) => {
        const { did } = req.params;
        ArticlePage.find({ doctor: did, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    GetArticlePagesByDoctorIdAndCatId: (req, res, next) => {
        const { did, catid } = req.params;
        ArticlePage.find({ cat: catid, doctor: did, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据Cat ID获取 article page list
    GetArticlePagesByCatId: (req, res, next) => {
        const { catid } = req.params;
        ArticlePage.find({ cat: catid, hid: req.token.hid })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建页面
    Add: (req, res, next) => {
        const item = req.body;
        // doctor
        if (!item.doctor) {
            return Status.returnStatus(res, Status.NO_DOCTOR);
        }
        // name
        if (!item.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        // category
        if (!item.cat) {
            return Status.returnStatus(res, Status.NO_CAT);
        }
        // category
        if (!item.title) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        // 创建
        ArticlePage.create(item)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        ArticlePage.findByIdAndUpdate(id, req.body, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        ArticlePage.findByIdAndDelete(id)
        .select('-hid -__v')
        .then((result) => res.json(result))
        .catch(err => next(err));
    },

}