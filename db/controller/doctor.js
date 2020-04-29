/**
 * Created by hhu on 2016/5/7.
 */
var Doctor = require('../model/doctor.js');
const Hospital = require('../model/hospital');
var Relationship = require('../model/relationship.js');
var Q = require('q');
const util = require('../../util/util');

module.exports = {


    GetAllDoctors: function (req, res) {
        var number = 999; // set max return numbers

        var query = { role: { $lt: 2 }, apply: true, hid: req.token.hid };
        if (req.params && req.params.number) {
            number = +req.params.number;
        }

        Doctor.find(query)
            .sort({ order: 1, updated: -1 })
            .limit(number)
            .exec(function (err, items) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!items || items.length < 1) {
                    return Status.returnStatus(res, Status.NULL);
                }

                res.json(items);
            });
    },

    // for CMS //never use?
    GetAll: function (req, res) {
        var number = 999; // set max return numbers
        var query = { hid: req.token.hid };
        if (req.params && req.params.number) {
            number = +req.params.number;
        }

        Doctor.find(query)
            .sort({ order: 1, updated: -1 })
            .limit(number)
            .exec(function (err, items) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!items || items.length < 1) {
                    return Status.returnStatus(res, Status.NULL);
                }

                res.json(items);
            });
    },

    getFocusDoctors: function (userId) {
        var deferred = Q.defer();

        Relationship.find({ user: userId, role: { $lt: 2 }, apply: true })
            .sort({ order: 1, updated: -1 })
            .exec(function (err, items) {
                if (err) {
                    deferred.resolve([]);
                }

                if (!items || items.length < 1) {
                    deferred.resolve([]);

                }

                var doctors = items.map(function (a) { return a.doctor; });
                deferred.resolve(doctors);
            });

        return deferred.promise;
    },

    // 查找未关注药师
    GetAllNotFocus: function (req, res) {

        if (req.params && req.params.user) {
            Relationship.getFocusDoctors(req.params.user).then(function (doctors) {
                var query = {
                    _id: { "$nin": doctors },
                    role: { $lt: 2 },
                    apply: true,
                    hid: req.token.hid
                };
                Doctor.find(query)
                    .sort({ order: 1, updated: -1 })
                    //.limit(number)
                    .exec(function (err, items) {
                        if (err) {
                            return Status.returnStatus(res, Status.ERROR, err);
                        }
                        if (!items || items.length < 1) {
                            return Status.returnStatus(res, Status.NULL);
                        }

                        res.json(items);
                    });
            });
        }
    },

    //
    GetAndSkip: function (req, res) {

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
            .sort({ order: 1, updated: -1 })
            .skip(skip)
            .limit(number)
            .exec(function (err, items) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!items || items.length < 1) {
                    return Status.returnStatus(res, Status.NULL);
                }

                res.json(items);
            });
    },

    // 根据药师ID获取用户信息
    GetById: function (req, res) {

        if (req.params && req.params.id) {

            Doctor.findOne({ _id: req.params.id, apply: true })
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

    // 根据手机号码获取药师用户信息
    GetByCell: function (req, res) {

        if (req.params && req.params.cell) {
            var query = {
                cell: req.params.cell,
                apply: true,
                hid: req.token.hid
            };
            Doctor.findOne(query)
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item || item.length < 1) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.json(item);
                });

        }
    },

    // 根据用戶ID获取药师用户信息（用戶ID是唯一的，註冊前必須驗證）
    GetByUserId: function (req, res) {

        if (req.params && req.params.userid) {
            Doctor.findOne({ user_id: req.params.userid, apply: true })
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
    GetByDepartmentId: function (req, res) {

        if (req.params && req.params.departmentid) {

            Doctor.find({ department: req.params.departmentid, role: { $lt: 2 }, apply: true })
                .sort({ order: 1, updated: -1 })
                .exec(function (err, items) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!items || items.length < 1) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.json(items);
                });
        }
    },

    GetShortcuts: function (req, res) {
        if (req.params && req.params.did) {

            Doctor.findOne({ user_id: req.params.did, apply: true }, 'shortcuts -_id')
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.json(item.shortcuts || '');
                });
        }
    },

    UpdateShortcuts: function (req, res) {
        if (req.params && req.params.did) { // params.id is doctor's user ID
            // 获取user数据（json）
            var doctor = req.body;

            Doctor.findOne({ user_id: req.params.did, apply: true }, function (err, item) {
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
        }

    },

    // 创建药师用户
    AddByUserId: function (req, res) {

        if (req.params && req.params.id) { // params.id is doctor's user ID
            var uid = req.params.id;

            if (!uid) return Status.returnStatus(res, Status.NO_ID);

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

            Doctor.find({ user_id: uid }) // check if registered
                .exec(function (err, items) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (items && items.length > 0) {
                        return Status.returnStatus(res, Status.EXISTED);
                    }

                    Doctor.create({
                        hid: doctor.hid,
                        user_id: uid,
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
                        //     request.post({url:'http://139.224.68.92/zhaoys/wx/addDoctor', formData:{userId: uid, name: doctor.name}},
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
        }
    },

    UpdateByUserId: function (req, res) {
        if (req.params && req.params.id) { // params.id is doctor's user ID
            var uid = req.params.id;
            // 获取user数据（json）
            var doctor = req.body;

            Doctor.findOne({ user_id: uid }, function (err, item) {
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
                //console.log(JSON.stringify(item));

                //
                item.save(function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    res.json(raw);
                });

            });
        }
    },

    DeleteByUserId: function (req, res) {
        if (req.params && req.params.id) { // params.id is doctor's user ID

            Doctor.findOne({ user_id: req.params.id }, function (err, item) {
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
        }
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

    GetPassword: function (req, res) {

        if (req.params && req.params.did) { //doctor user id
            Doctor.findOne({ user_id: req.params.did, apply: true })
                .exec(function (err, item) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (!item || item.length < 1) {
                        return Status.returnStatus(res, Status.NULL);
                    }

                    res.send(util.decrypt(item.password));
                });

        }
    },

    //======================================================
    // 药师的基本信息: 包括名字,专科名字,title

    GetBriefInfo: function (req, res) {

        if (req.params && req.params.did) { //doctor user id
            Doctor.findOne({ _id: req.params.did, apply: true })
                .populate({ path: 'department', select: 'name' })
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