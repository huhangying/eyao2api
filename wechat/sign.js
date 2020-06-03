const axios = require('axios').default;
const TOKEN = 'harry';
const Hospital = require('../db/model/hospital');
const util = require('../util/util');
const Wechat = require('wechat-jssdk');
const wxConfig = {
    //set your oauth redirect url, defaults to localhost
    // "wechatRedirectUrl": "http://timebox.i234.me/wechat/",
    //"wechatToken": "wechat_token", //not necessary required
    "appId": 'wxac12d83affdb4dd5',
    "appSecret": 'a6cdf7e9c01039d03f3255cf5826a189',
}



module.exports = {
    // wechat sign test
    signatureTest: (req, res) => {
        // const { echostr } = req.query;
        // res.send(echostr);
        const wx = new Wechat(wxConfig);
        if (wx.jssdk.verifySignature(req.query)) {
            console.log('test success -->', req.query);

            res.send(req.query.echostr);
            return;
        }
        res.send("error");
    },

    // no user for now
    signatureAuth: (req, res) => {
        const { signature, timestamp, nonce, openid } = req.query;
        console.log(req.query);

        // const wx = new Wechat(wxConfig);
        // const url = wx.oauth.generateOAuthUrl('http://timebox.i234.me/wechat/', 'snsapi_base', '101');
        //console.log(url);
        const url = 'http://timebox.i234.me/wechat/entry?openid=' + openid;

        res.render("oauth-page", {
            wechatOAuthUrl: url,
        });
    },

    getSignature: (req, res, next) => {
        const wx = new Wechat(wxConfig);
        wx.jssdk.getSignature(req.query.url)
            .then((signatureData) => {
                return res.json(signatureData)
            })
            .catch(err => {
                console.log(err);
                next(err);
            });

    },

    getWeixinToken: (req, res, next) => {
        axios.get('https://api.weixin.qq.com/sns/oauth2/access_token',
            {
                params: req.query
            })
            .then((result) => {
                return res.json(result.data)
            })
            .catch(err => next(err));
    },

    createMenu: (req, res) => {

    },

    ///
    // api
    ///
    generateApiToken: async (req, res) => {
        const { uid } = req.params;
        const hosptial = await Hospital.findOne({ host: req.hostname, apply: true }, 'hid')
        if (!hosptial) {
            return Status.sendStatus(403);
        }
        res.json(util.signToken({
            hid: hosptial.hid,
            id: uid
        }));
    }

}