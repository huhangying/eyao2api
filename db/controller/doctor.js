/**
 * Created by hhu on 2016/5/7.
 */
var Doctor = require('../model/doctor.js');
const Hospital = require('../model/hospital');
var Relationship = require('../model/relationship.js');
const util = require('../../util/util');

module.exports = {

    GetAllDoctors: (req, res, next) => {
        let { number } = req.params;
        number = +number || 999; // set default return numbers

        Doctor.find({ role: { $lt: 2 }, apply: true, hid: req.token.hid })
            .select('-hid -password -__v -created')
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

    // 查找关注药师 search by user_id
    // getFocusDoctors: function (userId) {
    //     var deferred = Q.defer();

    //     Relationship.find({ user: userId, hid: req.token.hid, role: { $lt: 2 },  apply: true })
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
                    role: { $lt: 2 },
                    apply: true,
                    hid: req.token.hid
                };
                Doctor.find(query)
                    .select('-hid -password -__v')
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
            role: { $lt: 2 },
            apply: true,
            hid: req.token.hid
        };
        Doctor.find(query)
            .select('-hid -password -__v')
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
            .select('-hid -password -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));

    },

    // 根据用戶ID获取药师用户信息（用戶ID是唯一的，註冊前必須驗證）
    GetByUserId: function (req, res) {

        if (req.params && req.params.userid) {
            Doctor.findOne({ user_id: req.params.userid, apply: true })
                .select('-hid -password -__v')
                .lean()
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.json(item);
                });
        }
    },

    // 根据药师ID获取用户信息
    GetByDepartmentId: (req, res, next) => {
        const { departmentid } = req.params;
        Doctor.find({ department: departmentid, hid: req.token.hid, role: { $lt: 2 }, apply: true })
            .select('-hid -password -__v')
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

    UpdateShortcuts: function (req, res) {
        const { did } = req.params;   //doctor user id
        // 获取user数据（json）
        var doctor = req.body;

        Doctor.findOne({ user_id: did, hid: doctor.hid, apply: true }, function (err, item) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            if (!item) {
                return Status.returnStatus(res, Status.NULL);
            }

            if (doctor.shortcuts || doctor.shortcuts == '') {
                item.shortcuts = doctor.shortcuts;
            }

            //
            item.save(function (err, raw) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }
                res.json(raw.shortcuts || '');
            });
        });
    },

    // 创建药师用户
    AddByUserId: function (req, res) {
        const { userid } = req.params; // doctor's user ID

        // 获取doctor数据（json）
        var doctor = req.body;

        // 用户参数验证

        // password
        if (!doctor.password) {
            return Status.returnStatus(res, Status.NO_PASSWORD);
        }

        // role
        if (!doctor.role) {
            doctor.role = 0;
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


        // gender

        // expertise

        // bulletin

        // icon

        Doctor.find({ user_id: userid, hid: doctor.hid }) // check if registered
            .exec(function (err, items) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (items && items.length > 0) {
                    return Status.returnStatus(res, Status.EXISTED);
                }

                Doctor.create({
                    hid: doctor.hid,
                    user_id: userid,
                    password: util.encrypt(doctor.password),
                    role: doctor.role,
                    name: doctor.name,
                    department: doctor.department,
                    title: doctor.title,
                    tel: doctor.tel,
                    cell: doctor.cell,
                    gender: doctor.gender,
                    expertise: doctor.expertise,
                    bulletin: doctor.bulletin,
                    hours: doctor.hours,
                    honor: doctor.honor,
                    icon: doctor.icon,
                    order: doctor.order,
                    apply: doctor.apply || true
                }, function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    // 同步消息给药师端 ()－－－ 现在不需要了
                    // http://139.224.68.92/medical/wx/addDoctor 这是同步药师的接口，需要传入的参数1、userId 2、name
                    // if (doctor.role === 0 || doctor.role === 1) {
                    //     request.post({url:'http://139.224.68.92/zhaoys/wx/addDoctor', formData:{userId: userid, name: doctor.name}},
                    //         function optionalCallback(err, httpResponse, body) {
                    //             if (err) {
                    //                 return console.error('sync failed:', err);
                    //             }
                    //             //console.log('sync successful!  Server responded with:', body);
                    //         });
                    // }

                    return res.send(raw);
                });

            });
    },

    UpdateByUserId: function (req, res) {
        const { userid } = req.params; // doctor's user ID
        // 获取user数据（json）
        var doctor = req.body;

        Doctor.findOne({ user_id: userid, hid: doctor.hid }, function (err, item) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            if (!item) {
                return Status.returnStatus(res, Status.NULL);
            }

            if (doctor.password)
                item.password = util.encrypt(doctor.password);
            if (doctor.name)
                item.name = doctor.name;
            if (doctor.department)
                item.department = doctor.department;
            if (doctor.title)
                item.title = doctor.title;
            if (doctor.tel)
                item.tel = doctor.tel;
            if (doctor.cell)
                item.cell = doctor.cell;
            if (doctor.gender)
                item.gender = doctor.gender;
            if (doctor.expertise)
                item.expertise = doctor.expertise;
            if (doctor.bulletin)
                item.bulletin = doctor.bulletin;
            if (doctor.hours)
                item.hours = doctor.hours;
            if (doctor.honor)
                item.honor = doctor.honor;
            if (doctor.icon)
                item.icon = doctor.icon;
            if (doctor.role || doctor.role === 0)
                item.role = doctor.role;
            if (doctor.order || doctor.order === 0)
                item.order = doctor.order;
            if (doctor.apply || doctor.apply === false)
                item.apply = doctor.apply;

            if (doctor.status || doctor.status === 0) {
                item.status = doctor.status;
            }

            //
            item.save(function (err, raw) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }
                res.json(raw);
            });

        });

    },

    DeleteByUserId: function (req, res) {
        const { userid } = req.params; // doctor's user ID

        Doctor.findOne({ user_id: userid, hid: req.token.hid }, function (err, item) {
            if (err) {
                return Status.returnStatus(res, Status.ERROR, err);
            }

            if (!item) {
                return Status.returnStatus(res, Status.NULL);
            }

            //
            item.remove(function (err, raw) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }
                res.json(raw);
            });

        });
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
    Login: async (req, res) => {
        // 获取 login 数据（json）
        var login = req.body;
        if (!login) return res.sendStatus(400);

        // user_id
        if (!login.user_id) {
            return Status.returnStatus(res, Status.NO_ID);
        }

        const hosptial = await Hospital.findOne({ host: req.hostname, apply: true }, 'hid')
        if (!hosptial) {
            return Status.sendStatus(403);
        }

        // password
        if (!login.password) {
            return Status.returnStatus(res, Status.NO_PASSWORD);
        }

        var query = {
            user_id: login.user_id,
            hid: hosptial.hid,
            apply: true
        };
        Doctor.findOne(query,
            { _id: 1, user_id: 1, hid: 1, password: 1, name: 1, icon: 1, title: 1, department: 1, role: 1, token: 1 }, // select fields
            function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NOT_REGISTERED);
                }

                // check password
                if (login.password != util.decrypt(item.password)) {
                    return Status.returnStatus(res, Status.WRONG_PASSWORD);
                }

                item.password = undefined; // remove password!
                item.token = util.signToken({
                    hid: 1, // set hid=1 for test
                    id: item.id,
                    user_id: item.user_id,
                    role: item.role
                });
                return res.json(item);
                //todo: remove returning _id later
            });

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
            .populate({ path: 'department', select: 'name' })
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