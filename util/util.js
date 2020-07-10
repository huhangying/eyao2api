/**
 * Created by hhu on 2016/5/8.
 */
// const mongoose = require('mongoose');
const CryptoJS = require("crypto-js");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const ENCRYPT_KEY = 'xinhua e yao';
const SECRET_KEY = "YRRAh";
//1h 59m, weixin token is only valid within 2 hours
const REFRESH_INTERVAL = 1000 * 119 * 60;
const TOKEN = 'harry';

///////////////////////////////////////////
// for Wechat belows
const nonceStr = function () {
    return Math.random()
        .toString(36)
        .substr(2, 15);
}
const timestamp = function () {
    return parseInt(new Date().getTime() / 1000) + '';
}
const isExpired = function (modifyDate, interval) {
    /* istanbul ignore else  */
    if (interval === undefined) interval = REFRESH_INTERVAL;
    return Date.now() - new Date(modifyDate).getTime() > interval;
}
const verifySignature = (query) => {
    const keys = [
        TOKEN,
        query.timestamp,
        query.nonce
    ];
    let str = keys.sort().join('');
    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    const hashCode = crypto.createHash('sha1'); //创建加密类型 
    str = hashCode.update(str,'utf8').digest('hex'); //对传入的字符串进行加密
    return str === query.signature;
}
const getXMLNodeValue = (node_name, xml) => {
    const tmp = xml.split("<" + node_name + ">");
    const _tmp = tmp[1].split("</" + node_name + ">");
    return _tmp[0];
}


module.exports = {

    // toObjectId: (id) => {
    //     return mongoose.Types.ObjectId(id);
    // },

    encrypt: function (str) {
        const ciphertext = CryptoJS.AES.encrypt(str, ENCRYPT_KEY);
        return ciphertext.toString();
    },

    decrypt: function (str) {
        const bytes = CryptoJS.AES.decrypt(str, ENCRYPT_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    },


    signToken: (data) => {
        return jwt.sign(data, SECRET_KEY, { expiresIn: '1d' });
    },

    // middleware
    verifyToken: (req, res, next) => {
        if (req.url.indexOf('login') > 0 || req.url.indexOf('auth') > 0) {
            return next(); // login is the only exception
        }

        const authHeader = req.headers ? req.headers.authorization : null;
        if (authHeader) {
            const token = authHeader.split(' ').pop();
            if (token) {
                jwt.verify(token, SECRET_KEY, (err, data) => {
                    //todo: handle expired later
                    if (err) {
                        // return res.status(403).json(err);
                        return res.sendStatus(403);
                    }
                    if (!data.hid || !data.id) {
                        return res.sendStatus(401);
                    }
                    // pre validation
                    if (['PATCH', 'POST'].indexOf(req.method) >= 0) {
                        // body is must
                        if (!req.body) {
                            return res.sendStatus(400);
                        } else {
                            req.body.hid = +data.hid; // convert string to number
                        }
                    } else {
                        // DELETE and GET 现在不能放入req.params，所以用req.token
                        req.token = data;
                    }
                    next();
                });
            } else {
                return res.sendStatus(401);
            }
        } else {
            return res.sendStatus(401);
        }
    },
    // for Wechat belows
    nonceStr,
    timestamp,
    isExpired,
    verifySignature,
    getXMLNodeValue,
}