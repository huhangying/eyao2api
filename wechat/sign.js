const TOKEN = 'harry';
const Wechat = require('wechat-jssdk');

const wxConfig = {
    //set your oauth redirect url, defaults to localhost
    "wechatRedirectUrl": "http://timebox.i234.me/wechat/oauth-callback",
    //"wechatToken": "wechat_token", //not necessary required
    "appId": 'wxac12d83affdb4dd5',
    "appSecret": 'a6cdf7e9c01039d03f3255cf5826a189',
    // card: true, //enable cards
    // payment: true, //enable payment support
    // merchantId: '', //
    // paymentSandBox: true, //dev env
    // paymentKey: '', //API key to gen payment sign
    // paymentCertificatePfx: fs.readFileSync(path.join(process.cwd(), 'cert/apiclient_cert.p12')),
    //default payment notify url
    // paymentNotifyUrl: `http://your.domain.com/api/wechat/payment/`,
}


module.exports = {
    // wechat sign test
    signatureTest: (req, res) => {
        const { signature, timestamp, nonce, echostr } = req.query;
        // console.log(signature, timestamp, nonce, echostr);
        res.send(echostr);
    },

    signatureAuth: (req, res) => {
        const { signature, timestamp, nonce, openid } = req.query;
        console.log(signature, timestamp, nonce, openid);

        const wx = new Wechat(wxConfig);
        //const url = wx.oauth.generateOAuthUrl('http://timebox.i234.me/wechat/', 'snsapi_base', '101');
        //console.log(url);
        
        // res.render("oauth-page", {
        //     wechatOAuthUrl: url,
        // });
        res.redirect('/wechat/?openid=' + openid);
        // res.send(openid);
    },

    checkSignature: (req, res) => {
        const wx = new Wechat(wxConfig);
        try {
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