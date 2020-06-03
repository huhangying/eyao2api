const axios = require('axios').default;
const TOKEN = 'harry';
const Hospital = require('../db/controller/hospital');
const util = require('../util/util');
const Wechat = require('wechat-jssdk');
const Const = require('../db/controller/const');
const wxConfig = {
	//set your oauth redirect url, defaults to localhost
	// "wechatRedirectUrl": "http://timebox.i234.me/wechat/",
	//"wechatToken": "wechat_token", //not necessary required
	"appId": 'wxac12d83affdb4dd5',
	"appSecret": 'a6cdf7e9c01039d03f3255cf5826a189',
}



module.exports = {
	// wechat sign test
	authTest: (req, res) => {
		const wx = new Wechat(wxConfig);
		if (wx.jssdk.verifySignature(req.query)) {
			res.send(req.query.echostr);
			return;
		}
		res.send("error");
	},

	// save signature
	receiveAuth: (req, res, next) => {
		const { signature, timestamp, nonce, openid } = req.query;
		console.log(req);
		//this.getWechatSettings()
		const wx = new Wechat(wxConfig);
		// const url = wx.oauth.generateOAuthUrl('http://timebox.i234.me/wechat/', 'snsapi_base', '101');
		//console.log(url);
		const url = 'http://timebox.i234.me/wechat?openid=' + openid;
		wx.jssdk.getSignature(url)
			.then(rsp => res.json(rsp))
			.catch(err => {
				console.log(err);
				next(err);
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
		const hosptial = await Hospital.findHidByHost(req.hostname);
		if (!hosptial) {
			return Status.returnStatus(res, Status.FAILED);
		}
		res.json(util.signToken({
			hid: hosptial.hid,
			id: uid
		}));
	},

	//////////////////////////////////////////////////////////////
	// Functions belows

	getWechatSettings: async (hid) => {

		const results = await Const.getByGroup(2, hid); // 2 is for wechat
		const appId = results.find(_ => _.name === 'appId').value;
		const appSecret = results.find(_ => _.name === 'secret').value;
		return {
			appId: appId,
			appSecret: appSecret,
		};
	}


}