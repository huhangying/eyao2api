/**
 * Created by hhu on 2016/4/27.
 */
const User = require('../model/user');

// for detele check
const Booking = require('../model/booking');
const Chatroom = require('../model/chatroom');
const Diagnose = require('../model/diagnose');
const labResult = require('../model/labResult');
const Prescription = require('../model/prescription');
const Relationship = require('../model/relationship');
const Survey = require('../model/survey');
const UserFeedback = require('../model/userFeedback');

const self = module.exports = {

    GetAll: (req, res, next) => {
        let { number } = req.params;
        number = +number || 999; // set default return numbers
        User.find({ hid: req.token.hid })
            .select('-hid -password -__v')
            .sort({ updated: -1 })
            .limit(number)
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取用户信息
    GetById: (req, res, next) => {
        const { id } = req.params;
        User.findOne({ _id: id })
            .select('-hid -password -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据微信号获取用户信息
    GetByLinkId: (req, res, next) => {
        const { id } = req.params; // id is link_id
        User.findOne({ link_id: id, apply: true, hid: req.token.hid })
            .select('-hid -password -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据ID获取用户信息
    Search: (req, res, next) => {
        const option = req.body;

        const filter_options = { hid: option.hid };
        if (option.name) {
            filter_options.name = new RegExp(option.name, "i");
        }
        else if (option.cell) {
            filter_options.cell = new RegExp(option.cell, "i");
        }
        else if (option.admissionNumber) {
            filter_options.admissionNumber = new RegExp(option.admissionNumber, "i");
        }
        else if (option.sin) {
            filter_options.sin = new RegExp(option.sin, "i");
        }

        User.find(filter_options)
            .select('-hid -password -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据手机号码获取用户信息
    GetByCell: (req, res, next) => {
        const { cell } = req.params;
        User.find({ cell: cell, apply: true, hid: req.token.hid })
            .select('-hid -password -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));

    },

    // 根据微信号创建用户
    AddByLinkId: function (req, res) {
        if (req.params && req.params.id) { // params.id is WeChat ID
            var linkId = req.params.id;

            if (!linkId) return Status.returnStatus(res, Status.NO_ID);

            // 获取user数据（json）
            var user = req.body;

            // 用户参数验证

            //验证手机号码
            if (!user.cell) {
                return Status.returnStatus(res, Status.NO_CELL);
            }

            // name
            if (!user.name) {
                return Status.returnStatus(res, Status.NO_NAME);
            }

            // gender

            // birth date

            // sin

            // admission number

            User.findOne({ link_id: linkId }) // check if registered
                .exec(function (err, _user) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    if (_user && _user.apply) {
                        return Status.returnStatus(res, Status.EXISTED);
                    }

                    if (!_user) {
                        User.create({
                            hid: user.hid,
                            link_id: linkId,
                            cell: user.cell,
                            name: user.name,
                            password: user.password,
                            gender: user.gender,
                            icon: user.icon,
                            birthdate: user.birthdate,
                            sin: user.sin,
                            apply: user.apply || true
                        },
                            function (err, raw) {
                                if (err) {
                                    return Status.returnStatus(res, Status.ERROR, err);
                                }

                                return res.json(raw);
                            });
                    }
                    else { // user.apply == false
                        _user.cell = user.cell;
                        _user.name = user.name;
                        //_user.password = user.password;
                        _user.gender = user.gender;
                        _user.icon = user.icon;
                        _user.birthdate = user.birthdate;
                        _user.apply = true;

                        _user.save();

                        return res.json(_user);
                    }


                });
        }
    },

    // 用于用户注册前,关联用户与药师的关系
    AddPresetByLinkId: function (req, res) {
        if (req.params && req.params.id) { // params.id is WeChat ID
            var linkId = req.params.id;

            if (!linkId) return Status.returnStatus(res, Status.NO_ID);

            User.create({
                hid: linkId.hid,
                link_id: linkId,
                apply: false
            },
                function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    return res.json(raw);

                });
        }
    },

    UpdateByLinkId: function (req, res) {
        if (req.params && req.params.id) { // params.id is WeChat ID
            var linkId = req.params.id;

            // 获取user数据（json）
            var user = req.body;

            User.findOne({ link_id: linkId }, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }

                if (user.name)
                    item.name = user.name;
                if (user.cell)
                    item.cell = user.cell;
                if (user.gender)
                    item.gender = user.gender;
                if (user.birthdate)
                    item.birthdate = user.birthdate;
                if (user.role || user.role == 0)
                    item.role = user.role;
                if (user.sin)
                    item.sin = user.sin;
                if (user.admissionNumber)
                    item.admissionNumber = user.admissionNumber;
                if (user.icon)
                    item.icon = user.icon || '';
                if (user.apply || user.apply === false)
                    item.apply = user.apply;

                if (user.visitedDepartments) {
                    item.visitedDepartments = user.visitedDepartments;
                }

                //console.log(JSON.stringify(item));

                //
                item.save(function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    res.json(raw); //update user success
                });

            });
        }
    },

    // for test
    DeleteById: async (req, res, next) => {
        const {id} = req.params; // user's _id
        const allow = await self.allowToDelete(id, req.token.hid);
        if (!allow) {
            return Status.returnStatus(res, Status.DELETE_NOT_ALLOWED)
        }

        User.findByIdAndDelete(id)
            .select('-hid -__v -password')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // functions for delete
    allowToDelete: async (id, hid) => {
        let existed = true;
        try {
            existed = await Booking.exists({ user: id, hid: hid })
            if (existed) return false;

            existed = await Chatroom.exists({ user: id, hid: hid })
            if (existed) return false;

            existed = await Diagnose.exists({ user: id, hid: hid })
            if (existed) return false;

            existed = await labResult.exists({ user: id, hid: hid })
            if (existed) return false;

            existed = await Prescription.exists({ user: id, hid: hid })
            if (existed) return false;

            existed = await Relationship.exists({ user: id, hid: hid })
            if (existed) return false;

            existed = await Survey.exists({ user: id, hid: hid })
            if (existed) return false;

            existed = await UserFeedback.exists({ user: id, hid: hid })
            if (existed) return false;
        } catch (e) {
            return false;
        }
        return true;
    },

    UpdateIcon: function (req, res) {
        if (req.params && req.params.cell) {
            var query = { cell: req.params.cell };
            var update = { icon: 'http://101.200.81.99:808/server/icons/' + req.params.cell + '.jpg' };
            var options = { new: false };

            User.findOneAndUpdate(query, update, options,
                function (err, usr) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    res.json(usr);
                });
        }
    },

    //====================================================== for service

    GetNameById: function (id) {
        User.findOne({ _id: id })
            .exec(function (err, item) {
                console.log(JSON.stringify((item)));

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

