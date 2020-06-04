const axios = require('axios').default;
const Hospital = require('../db/controller/hospital');
const util = require('../util/util');
const Wechat = require('wechat-jssdk');
const Const = require('../db/controller/const');
const SignatureStore = require('./signature.controller');
const wxConfig = {
	"appId": 'wxac12d83affdb4dd5',
	"appSecret": 'a6cdf7e9c01039d03f3255cf5826a189',
}



module.exports = {
	// wechat sign test
	authTest: (req, res) => {
		res.send(req.query.echostr);
		// if (util.verifySignature(req.query)) {
		// 	res.send(req.query.echostr);
		// 	return;
		// }
		// res.send("error");

	},

	// save signature
	receiveAuth: (req, res) => {
		const { signature, timestamp, nonce, openid } = req.query;
		SignatureStore.UpsertSignature({
			signature: signature,
			timestamp: timestamp,
			nonce: nonce,
			openid: openid
		}).exec();
		res.end();
	},

	//todo: remove
	getSignatureByUrl: (req, res, next) => {
		const { url } = req.params;
		// // get from signature store
		// SignatureStore.GetByOpenId(openid);
		const wx = new Wechat(wxConfig);
		wx.jssdk.getSignature(url)
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

	refreshWeixinToken: (req, res, next) => {
		axios.get('https://api.weixin.qq.com/sns/oauth2/refresh_token',
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
		const { openid } = req.params;
		const hosptial = await Hospital.findHidByHost(req.hostname);
		if (!hosptial) {
			return Status.returnStatus(res, Status.FAILED);
		}
		res.json(util.signToken({
			hid: hosptial.hid,
			id: openid,
			role: 0
		}));
	},

	//////////////////////////////////////////////////////////////
	// Functions belows

	getWechatSettings: async (hid) => {

		const results = await Const.getByGroup(2, hid); // 2 is for wechat
		const appid = results.find(_ => _.name === 'appid').value;
		const secret = results.find(_ => _.name === 'secret').value;
		return {
			appid: appid,
			secret: secret,
		};
	}


}