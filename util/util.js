/**
 * Created by hhu on 2016/5/8.
 */
// const mongoose = require('mongoose');
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');
const ENCRYPT_KEY = 'xinhua e yao';
const SECRET_KEY = "YRRAh";

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
        if (req.url.indexOf('login') > 0 || req.url.indexOf('wechat') > 0) {
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
                            req.body.hid = data.hid;
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
}