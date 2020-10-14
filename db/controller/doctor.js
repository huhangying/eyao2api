
const Doctor = require('../model/doctor.js');
const Hospital = require('./hospital');
const Relationship = require('../model/relationship.js');
const util = require('../../util/util');
const { allowToDeleteDoctor } = require('../../util/allow-to');

module.exports = {

    GetAllDoctors: (req, res, next) => {
        let { number } = req.params;
        number = +number || 999; // set default return numbers

        Doctor.find({ role: { $lt: 3 }, apply: true, hid: req.token.hid })
            .select('-hid -password -qrcode -__v -created')
            .sort({ order: 1, updated: -1 })
            .limit(number)
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // for CMS //never use?
    GetAll: (req, res, next) => {
        let { number } = req.params;
        number = +number || 999; // set default return numbers

        Doctor.find({ hid: req.token.hid })
            .select('-hid -password -__v')
            .sort({ order: 1, updated: -1 })
            .limit(number)
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 搜索药师名
    SearchDoctorsByName: (req, res, next) => {
        const { name } = req.params;

        Doctor.find({ hid: req.token.hid, apply: true, name: { $regex: name } })
            .select('-hid -password -__v')
            .populate({ path: 'department', select: '_id name ' })
            .sort({ order: 1, updated: -1 })
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 查找关注药师 search by user_id
    // getFocusDoctors: function (userId) {
    //     var deferred = Q.defer();

    //     Relationship.find({ user: userId, hid: req.token.hid, role: { $lt: 3 },  apply: true })
    //         .sort({ order: 1, updated: -1 })
    //         .exec(function (err, items) {
    //             if (err) {
    //                 deferred.resolve([]);
    //             }

    //             if (!items || items.length < 1) {
    //                 deferred.resolve([]);

    //             }

    //             var doctors = items.map(function (a) { return a.doctor; });
    //             deferred.resolve(doctors);
    //         });

    //     return deferred.promise;
    // },

    // 查找未关注药师 search by user_id
    GetAllNotFocus: (req, res, next) => {
        const { did } = req.params;
        Relationship.getFocusDoctors(did, req.token.hid)
            .then(doctors => {
                const query = {
                    _id: { "$nin": doctors },
                    role: { $lt: 3 },
                    apply: true,
                    hid: req.token.hid
                };
                Doctor.find(query)
                    .select('-hid -password -qrcode -__v')
                    .sort({ order: 1, updated: -1 })
                    .lean()
                    .then((result) => res.json(result))
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    },

    //
    GetAndSkip: (req, res, next) => {

        // validation
        if (!req.params.number || !req.params.skip) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        var number = +req.params.number;
        if (number == 0) {
            return Status.returnStatus(res, Status.INVALID_PARAM);
        }
        var skip = +req.params.skip;
        //console.log('number: ' + number + ', skip: ' + skip);

        var query = {
            role: { $lt: 3 },
            apply: true,
            hid: req.token.hid
        };
        Doctor.find(query)
            .select('-hid -password -qrcode -__v')
            .sort({ order: 1, updated: -1 })
            .skip(skip)
            .limit(number)
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID获取用户信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        Doctor.findOne({ _id: id, apply: true })
            .select('-hid -password -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据手机号码获取药师用户信息
    GetByCell: (req, res, next) => {
        const { cell } = req.params;
        const query = {
            cell: cell,
            apply: true,
            hid: req.token.hid
        };
        Doctor.findOne(query)
            .select('-hid -password -qrcode -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));

    },

    // 根据用戶ID获取药师用户信息（用戶ID是唯一的，註冊前必須驗證）
    GetByUserId: (req, res, next) => {
        const { userid } = req.params;
        Doctor.findOne({ user_id: userid, apply: true, hid: req.token.hid })
            .select('-hid -password -qrcode -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据药师ID获取用户信息
    GetByDepartmentId: (req, res, next) => {
        const { departmentid } = req.params;
        Doctor.find({ department: departmentid, hid: req.token.hid, role: { $lt: 3 }, apply: true })
            .select('-hid -password -qrcode -__v')
            .lean()
            .sort({ order: 1, updated: -1 })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    GetShortcuts: (req, res, next) => {
        const { did } = req.params;   //doctor user id
        Doctor.findOne({ user_id: did, hid: req.token.hid, apply: true })
            .select('shortcuts')
            .lean()
            .then((result) => {
                if (!result) {
                    return Status.returnStatus(res, Status.NULL);
                }
                return res.json(result.shortcuts || '');
            })
            .catch(err => next(err));
    },

    //todo: combine with UpdateByUserId
    UpdateShortcuts: (req, res, next) => {
        const { did } = req.params;   //doctor user id
        const item = req.body;
        Doctor.findOneAndUpdate({ user_id: did, hid: item.hid }, item, { new: true })
            .select('shortcuts')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 创建药师用户
    Add: (req, res, next) => {
        const doctor = { ...req.body };
        // 用户参数验证
        // name
        if (!doctor.user_id) {
            return Status.returnStatus(res, Status.NO_ID);
        }
        // password
        if (!doctor.password) {
            return Status.returnStatus(res, Status.NO_PASSWORD);
        } else {
            doctor.password = util.encrypt(doctor.password);
        }
        // department
        if (!doctor.department) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }
        // name
        if (!doctor.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }
        //验证手机号码
        if (!doctor.cell) {
            return Status.returnStatus(res, Status.NO_CELL);
        }

        // default role
        doctor.role = 0;
        Doctor.exists({ user_id: doctor.user_id, hid: doctor.hid })// check if registered
            .then(result => {
                if (result) return Status.returnStatus(res, Status.EXISTED);

                Doctor.create(doctor)
                    .then((result) => res.json(result))
                    .catch(err => next(err));
            })
            .catch(err => next(err));
    },

    UpdateByUserId: (req, res, next) => {
        const { userid } = req.params; // doctor's user ID
        // 获取user数据（json）
        var doctor = { ...req.body };
        if (doctor.password)
            doctor.password = util.encrypt(doctor.password);
        Doctor.findOneAndUpdate({ user_id: userid, hid: doctor.hid }, doctor, { new: true })
            .then((result) => {
                if (!result) {
                    return Status.returnStatus(res, Status.NULL);
                }
                return res.json(result)
            })
            .catch(err => next(err));
    },

    DeleteById: async (req, res, next) => {
        const { id } = req.params; // doctor's _id
        const allow = await allowToDeleteDoctor(id, req.token.hid);
        if (!allow) {
            return Status.returnStatus(res, Status.DELETE_NOT_ALLOWED)
        }

        Doctor.findByIdAndDelete(id)
            .select('-hid -__v -password')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateIcon: function (req, res) {
        if (req.params && req.params.cell) {
            var query = { cell: req.params.cell };
            var update = { icon: 'http://101.200.81.99:808/server/icons/' + req.params.cell + '.jpg' };
            var options = { new: false };

            Doctor.findOneAndUpdate(query, update, options,
                function (err, usr) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    res.json(usr);
                });
        }
    },

    //================== login ===================
    // 注：login API 检测 hostname 得到hid，并需要返回token
    Login: async (req, res, next) => {
        // 获取 login 数据（json）
        const login = req.body;

        // user_id
        if (!login.user_id) {
            return Status.returnStatus(res, Status.NO_ID);
        }
        // password
        if (!login.password) {
            return Status.returnStatus(res, Status.NO_PASSWORD);
        }
        const hosptial = await Hospital.getHidByHost(req.hostname);
        if (!hosptial) {
            return Status.returnStatus(res, Status.FAILED);
        }

        const query = {
            user_id: login.user_id,
            hid: hosptial.hid,
            apply: true
        };
        Doctor.findOne(query)
            .select('_id user_id hid password name icon title department role token shortcuts status prices')
            .then((result) => {
                if (!result) {
                    return Status.returnStatus(res, Status.NOT_REGISTERED);
                }
                // check password
                if (login.password != util.decrypt(result.password)) {
                    return Status.returnStatus(res, Status.WRONG_PASSWORD);
                }
                result.password = undefined; // remove password!

                result.token = util.signToken({
                    hid: hosptial.hid,
                    id: result.id,
                    role: result.role
                });
                result.hospitalName = hosptial.name;
                result.wechatUrl = hosptial.wxurl;
                result.cs = hosptial.cs;
                return res.json(result);
            })
            .catch(err => next(err));
    },

    GetPassword: (req, res, next) => {
        const { did } = req.params;   //doctor user id
        Doctor.findOne({ user_id: did, hid: req.token.hid, apply: true })
            .then((result) => {
                if (!result) {
                    return Status.returnStatus(res, Status.NULL);
                }
                return res.send(util.decrypt(result.password))
            })
            .catch(err => next(err));
    },

    //======================================================
    // 药师的基本信息: 包括名字,专科名字,title

    GetBriefInfo: (req, res, next) => {
        const { id } = req.params;
        Doctor.findOne({ _id: id, apply: true })
            .select('-hid -password -__v')
            .populate('department', '_id name address')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    //====================================================== for service

    GetNameById: function (id) {

        Doctor.findOne({ _id: id })
            .exec(function (err, item) {
                if (err) {
                    return '';
                }

                if (!item) {
                    return '';
                }

                return item.name;
            });
    }
}