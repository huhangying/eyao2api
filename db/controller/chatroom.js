/**
 * Created by hhu on 2016/5/15.
 */
var Chatroom = require('../model/chatroom.js');
var UserService = require('./user.js');
var DoctorService = require('./doctor.js');
var Q = require('q');

module.exports = {

    //==================== Service
    // 查看有没有消息 - 查看自己的聊天室里面有没有对方的新消息！
    CheckDoctorMsg: function(req, res) {

        if (req.params && req.params.id) {

            Chatroom.find({doctor: req.params.id, user_unread: { $gte: 1} })
                .sort({updated: -1})
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

    CheckUserMsg: function(req, res) {

        if (req.params && req.params.id) {

            Chatroom.find({user: req.params.id, doctor_unread: { $gte: 1} })
                .sort({updated: -1})
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

    // return:
    //      number of unread: n;
    //      failed: -1
    ResetChatroom: function (id, direction) {
        var number = 0;

        Chatroom.findById(id)
            .exec(function (err, item) {
                if (err) {
                    return -1;
                }

                if (!item) {
                    return 0;
                }

                if (direction == 1) { // 医生只能读取患者的消息
                    if (item.user_unread > 0){
                        number = item.user_unread;
                        item.user_unread = 0;
                        item.save();

                        return number;
                    }
                }
                else if (direction == 0){  // 患者只能读取医生的消息
                    if (item.doctor_unread > 0){
                        number = item.doctor_unread;
                        item.doctor_unread = 0;
                        item.save();

                        return number;
                    }
                }
                return -1;
            })

    },

    // ===========================


    GetAll: function (req, res) {

        Chatroom.find({})
            .sort({created: -1})
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

    // 根据doctorID和用户ID获取聊天室信息
    GetByDoctorIdUserId: function (req, res) {

        if (req.params && req.params.doctorId && req.params.userId) {

            Chatroom.findOne({doctor: req.params.doctorId, user: req.params.userId})
                .sort({created: -1})
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

    // 根据药师ID 获取相关的聊天室记录
    GetByDoctorId: function (req, res) {

        if (req.params && req.params.id) {

            Chatroom.find({doctor: req.params.id})
                .sort({created: -1})
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

    // 根据患者ID 获取相关的聊天室记录
    GetByUserId: function (req, res) {

        if (req.params && req.params.id) {

            Chatroom.find({user: req.params.id})
                .sort({created: -1})
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

    // 根据ID获取详细信息
    GetById: function (req, res) {

        if (req.params && req.params.id) {

            var result = Chatroom.findOne({_id: req.params.id})
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


    // 创建聊天室
    FindOrAdd: function (req, res) {

        // 获取chatroom请求数据（json）
        var chatroom = req.body;
        if (!chatroom) return res.sendStatus(400);

        // name
        if (!chatroom.name) {
            return Status.returnStatus(res, Status.NO_NAME);
        }


        Chatroom.findOne({name: chatroom.name}) // check if existed
            .exec(function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                // 如果聊天室存在，直接返回
                if (item) {
                    return res.json(item);
                }

                // 不存在，创建
                Chatroom.create({

                    name: chatroom.name,
                    doctor: chatroom.doctor,
                    user: chatroom.user
                }, function (err, raw) {
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }

                    return res.send(raw);
                });

            });
    },

    UpdateById: function (req, res) {
        if (req.params && req.params.id) { // params.id is chatroom ID
            var id = req.params.id;

            // 获取chatroom数据（json）,只能更新聊天室名
            var chatroom = req.body;
            if (!chatroom) return res.sendStatus(400);

            Chatroom.findById(id, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item) {
                    return Status.returnStatus(res, Status.NULL);
                }

                if (chatroom.name)
                    item.name = chatroom.name;

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


    DeleteById: function (req, res) {
        if (req.params && req.params.id) { // params.id is chatroom ID

            Chatroom.findOne({_id: req.params.id}, function (err, item) {
                if (err) {
                    return Status.returnStatus(res, Status.ERROR, err);
                }

                if (!item){
                    return Status.returnStatus(res, Status.NULL);
                }

                //
                item.remove(function(err, raw){
                    if (err) {
                        return Status.returnStatus(res, Status.ERROR, err);
                    }
                    res.json(raw);
                });

            });
        }
    },


    //============================================================== Inner function

    // 根据 doctor 和 user IDs 查找chatroom。 如果不存在，则创建一个。
    // return: chatroom id;
    GetAndUpdateChatroom: function (userid, doctorid, direction, chatroom) {
        var deferred = Q.defer();
        var searchCriteria = {};
        if (chatroom) {
            searchCriteria._id = chatroom;
        }
        else {
            searchCriteria.user = userid;
            searchCriteria.doctor = doctorid;
        }

        if (direction == 0) { // !!! only difference: 0: populate doctor
            Chatroom.findOne( searchCriteria )
                .populate({ path: 'doctor', select: 'status' })
                .exec(function (err, item){
                    if (err) {
                        deferred.reject(err);
                    }

                    // 存在
                    if (item) {

                        if (direction == 0){
                            item.user_unread++;
                            if (item.doctor.status && item.doctor.status > 0) { // 加上自动回复的消息数
                                item.doctor_unread++;
                            }
                        }
                        else if (direction == 1){
                            item.doctor_unread++;
                        }
                        item.updated = Date.now();

                        item.save();
                        //console.log(JSON.stringify(item));

                        deferred.resolve(item);
                    }
                    else {

                        // 不存在，创建

                        // set chatroom name (format: user name | doctor name)
                        var name = userid + '|' + doctorid;
                        var user_unread = direction == 0 ? 1 : 0;
                        var doctor_unread = direction == 1 ? 1 : 0;

                        // create
                        Chatroom.create({
                                name: name,
                                doctor: doctorid,
                                user: userid,
                                user_unread: user_unread,
                                doctor_unread: doctor_unread
                            },
                            function (err, raw) {
                                if (err) {
                                    deferred.reject(err);
                                }

                                deferred.resolve(raw);
                            });
                    }

                });
        }
        else {
            Chatroom.findOne(searchCriteria)
                .exec(function (err, item){
                    if (err) {
                        deferred.reject(err);
                    }

                    // 存在
                    if (item) {

                        if (direction == 0){
                            item.user_unread++;
                        }
                        else if (direction == 1){
                            item.doctor_unread++;
                        }
                        item.updated = Date.now();

                        item.save();
                        //console.log(JSON.stringify(item));

                        deferred.resolve(item);
                    }
                    else {

                        // 不存在，创建

                        // set chatroom name (format: user name | doctor name)
                        var name = userid + '|' + doctorid;
                        var user_unread = direction == 0 ? 1 : 0;
                        var doctor_unread = direction == 1 ? 1 : 0;

                        // create
                        Chatroom.create({
                                name: name,
                                doctor: doctorid,
                                user: userid,
                                user_unread: user_unread,
                                doctor_unread: doctor_unread
                            },
                            function (err, raw) {
                                if (err) {
                                    deferred.reject(err);
                                }

                                deferred.resolve(raw);
                            });
                    }

                });
        }


        return deferred.promise;
    },
}