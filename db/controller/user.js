/**
 * Created by hhu on 2016/4/27.
 */
const User = require('../model/user');
const { allowToDeleteUser } = require('../../util/allow-to');

module.exports = {

    GetAll: (req, res, next) => {
        let { number } = req.params;
        number = +number || 999; // set default return numbers
        User.find({ hid: req.token.hid, apply: true })
            .select('-hid -password -__v')
            .sort({ updated: -1 })
            .limit(number)
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    GetAllCms: (req, res, next) => {
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

    GetAllByRole: (req, res, next) => {
        let { role } = req.params;
        User.find({ hid: req.token.hid, role: role, apply: true })
            .select('-hid -password -__v')
            .sort({ updated: -1 })
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

    // 根据ID获取用户信息
    Search: (req, res, next) => {
        const option = req.body;

        const filter_options = { 
            hid: option.hid,
            apply: true
        };
        if (option.name) {
            filter_options.name = new RegExp(option.name, "i");
        }
        else if (option.cell) {
            filter_options.cell = new RegExp(option.cell, "i");
        }
        else if (option.admissionNumber) {
            filter_options.admissionNumber = new RegExp(option.admissionNumber, "i");
        }
        else if (option.notes) {
            filter_options.notes = new RegExp(option.notes, "i");
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

    // 根据微信号获取用户信息
    GetByLinkId: (req, res, next) => {
        const { link_id } = req.params; // id is link_id
        User.findOne({ link_id: link_id, apply: true, hid: req.token.hid })
            .select('-hid -password -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // 根据微信号创建用户
    AddByLinkId: function (req, res) {
        const { link_id } = req.params;

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

        User.findOne({ link_id: link_id }) // check if registered
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
                        link_id: link_id,
                        cell: user.cell,
                        name: user.name,
                        password: user.password,
                        gender: user.gender,
                        icon: user.icon,
                        birthdate: user.birthdate,
                        sin: user.sin,
                        role: user.role || 0,
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
                    _user.role = user.role || 0;
                    _user.apply = true;

                    _user.save();

                    return res.json(_user);
                }
            });

    },

    // 用于用户注册前,关联用户与药师的关系 // need test!!!
    AddPresetByLinkId: (req, res, next) => {
        const { link_id } = req.params; // WeChat ID

        User.create({
            hid: req.body.hid,
            link_id: link_id,
            apply: false
        })
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateById: (req, res, next) => {
        const { id } = req.params;
        User.findByIdAndUpdate(id, req.body, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    UpdateByLinkId: (req, res, next) => {
        const { link_id } = req.params; // WeChat ID
        const user = req.body;

        User.findOneAndUpdate({ link_id: link_id, hid: user.hid }, user, { new: true })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // for test
    DeleteById: async (req, res, next) => {
        const { id } = req.params; // user's _id
        const allow = await allowToDeleteUser(id, req.token.hid);
        if (!allow) {
            return Status.returnStatus(res, Status.DELETE_NOT_ALLOWED)
        }

        User.findByIdAndDelete(id)
            .select('-hid -__v -password')
            .then((result) => res.json(result))
            .catch(err => next(err));
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

