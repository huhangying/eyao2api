const axios = require('axios').default;
const util = require('../util/util');
const Wechat = require('wechat-jssdk');
const Hospital = require('../db/controller/hospital');
const { Buffer } = require('buffer');
const SignatureStore = require('./signature.controller');
const wxConfig = {
	"appId": 'wxac12d83affdb4dd5',
	"appSecret": 'a6cdf7e9c01039d03f3255cf5826a189',
}
const messageHandler = require('./message-handler');



const self = module.exports = {
	// wechat sign test
	authTest: (req, res) => {
		//		res.send(req.query.echostr);
		if (util.verifySignature(req.query)) {
			res.send(req.query.echostr);
			return;
		}
		res.send("error");

	},

	// save signature
	receiveAuth: (req, res) => {
		const buffer = [];
		req.on("data", function (data) {
			/*微信服务器传过来的是xml格式的，是buffer类型，因为js本身只有字符串数据类型，所以需要通过toString把xml转换为字符串*/
			// _data = data.toString("utf-8");
			buffer.push(data);
		});
		req.on('end', async function () {
			const msgXml = Buffer.concat(buffer).toString('utf-8');
      try {
        const r = await messageHandler.msgHandler(msgXml);
        console.log('send Data:', r);
        res.send(r);
      } catch (error) {
        console.log('公众号消息事件Error:', error);
        res.send('error');
      }
    });


		// req.on("end", function () {
		// 	//console.log("end");
		// 	var ToUserName = util.getXMLNodeValue('ToUserName', _data);
		// 	var FromUserName = util.getXMLNodeValue('FromUserName', _data);
		// 	var CreateTime = util.getXMLNodeValue('CreateTime', _data);
		// 	var MsgType = util.getXMLNodeValue('MsgType', _data);
		// 	var Content = util.getXMLNodeValue('Content', _data);
		// 	var MsgId = util.getXMLNodeValue('MsgId', _data);
		// 	console.log(ToUserName);
		// 	console.log(FromUserName);
		// 	console.log(CreateTime);
		// 	console.log(MsgType);
		// 	console.log(Content);
		// 	console.log(MsgId);
		// 	var xml = '<xml><ToUserName>' + FromUserName + '</ToUserName><FromUserName>' + ToUserName + '</FromUserName><CreateTime>' + CreateTime + '</CreateTime><MsgType>' + MsgType + '</MsgType><Content>' + Content + '</Content></xml>';
		// 	res.send(xml);
		// });

		// check if openid registered


		// SignatureStore.UpsertSignature({
		// 	signature: signature,
		// 	timestamp: timestamp,
		// 	nonce: nonce,
		// 	openid: openid
		// }).exec();
		// res.sendStatus(200);
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

	getDoctorQrcode: async (req, res, next) => {
		const { did } = req.params;
		const token = await self.getWechatToken(req.token.hid);
		const data = {
			action_name: 'QR_LIMIT_STR_SCENE',
			action_info: {
				scene: {
					scene_str: did
				}
			}
		};
		axios.post('https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=' + token.data.access_token,
			data,
			{
				params: {
					access_token: token.data.access_token,
				}
			}
		).then((result) => {
			if (!result || !result.data || !result.data.ticket) {
				return Status.returnStatus(res, Status.FAILED)
			}
			return res.json(result.data);
		})
			.catch(err => next(err));
	},

	///
	// api
	///
	generateApiToken: (req, res) => {
		const { openid, hid } = req.params;
		res.json(util.signToken({
			hid: hid,
			id: openid,
			role: 0
		}));
	},

	//////////////////////////////////////////////////////////////
	// Functions belows

	getWechatToken: async (hid) => {
		// 1. get secret
		const secret = await Hospital.getSecretByHid(hid);

		// 2. get access_token
		return axios.get('https://api.weixin.qq.com/cgi-bin/token', {
			params: {
				appid: secret.appid,
				secret: secret.secret,
				grant_type: 'client_credential'
			}
		});
	}


}