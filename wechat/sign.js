const TOKEN = 'harry';
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
        res.send(req.query.echostr);
        // const wx = new Wechat(wxConfig);
        // if (wx.jssdk.verifySignature(req.query)) {
        //     res.send(req.query.echostr);
        //     return;
        // }
        // res.send("error");
    },

    signatureAuth: (req, res) => {
        const { signature, timestamp, nonce, openid } = req.query;
        console.log(req.query);

        // const wx = new Wechat(wxConfig);
        // const url = wx.oauth.generateOAuthUrl('http://timebox.i234.me/wechat/', 'snsapi_base', '101');
        //console.log(url);
        const url = 'http://timebox.i234.me/wechat/?openid=' + openid;

        // res.render("oauth-page", {
        //     wechatOAuthUrl: url,
        // });
    },

    getSignature: (req, res) => {
        try {
            const wx = new Wechat(wxConfig);
            wx.jssdk.getSignature(req.query.url).then(signatureData => {
                res.json(signatureData);
            });
        } catch (error) {
            res.sendStatus(500).json(error);
        }
    },

    createMenu: (req, res) => {

    }
}