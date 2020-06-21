const axios = require('axios').default;
const util = require('../util/util');
const Wechat = require('wechat-jssdk');
const { Buffer } = require('buffer');
const SignatureStore = require('./signature.controller');
const wxConfig = {
	"appId": 'wxac12d83affdb4dd5',
	"appSecret": 'a6cdf7e9c01039d03f3255cf5826a189',
}
const messageHandler = require('./message-handler');
const wxUtil = require('./wx-util');
const wxMsgQueue = require('../db/model/wxMsgQueue');
const User = require('../db/model/user');

const sendBookingTemplateMessage = async (req, res, next) => {
	const { openid, hid, data } = req.body;

	const access_token = await wxUtil.getAccessTokenByHid(hid);
	const template_id = await wxUtil.getBookingTemplateIdByHid(hid);
	axios.post('https://api.weixin.qq.com/cgi-bin/message/template/send',
		{
			touser: openid,
			template_id: template_id,
			url: 'http://timebox.i234.me/wechat/my-reservation?openid=' + openid + '&state=' + hid,
			data: data
		},
		{
			params: {
				access_token: access_token
			}
		})
		.then((result) => {
			return res.json(result.data)
		})
		.catch(err => next(err));
}

// System send it out
const sendClientMessage = async (req, res, next) => {
	const { openid } = req.params;
	const { hid, article } = req.body;
	const access_token = await wxUtil.getAccessTokenByHid(hid);
	_sendClientMessage(openid, hid, article, access_token)
		.then((result) => {
			if (result.data && result.data.errcode) {
				// save to message log for later retry
				save2MsgQueue({
					...article,
					type: 2,
					errcode: result.data.errcode,
					hid: hid,
					openid: openid
				});
			}
			return res.json(result.data)
		})
		.catch(err => next(err));
}

const _sendClientMessage = async (openid, article, access_token) => {
	return axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send',
		{
			touser: openid,
			msgtype: 'news',
			news: {
				articles: [article]
			}
		},
		{
			params: {
				access_token: access_token
			}
		});
}

const save2MsgQueue = (data) => {
	wxMsgQueue.findOneAndUpdate({ openid: data.openid, url: data.url, hid: data.hid }, data, { upsert: true, new: true })
		.then(async (result) => {
			if (result.tryCount < 1) {
				// mark in user table
				await User.findOneAndUpdate({ link_id: result.openid, hid: result.hid, apply: true },
					{ $inc: { msgInQueue: 1 }, updated: new Date() });
			} else {
				result.tryCount++;
				await result.save();
			}
		});
}

// 消息重新发送成功
const removeFromMsgQueue = (openid, url, hid) => {
	// 
	wxMsgQueue.findOneAndDelete({ openid: openid, url: url, hid: hid })
		.then(async (result) => {
			if (result) {
				// mark in user table
				await User.findOneAndUpdate({ link_id: openid, hid: hid, apply: true },
					{ $inc: { msgInQueue: -1 }, updated: new Date() });
				result.received = true;
				await result.save();
			}
		});
}

// 尝试重新发送失败的消息
const resendFailedMsg = async (req, res, next) => {
	const { openid } = req.params;
	const hid = req.token.hid;
	// get the list
	const msgs = await wxMsgQueue.find({ openid: openid, hid: hid, received: false });
	if (!msgs || msgs.length < 1) {
		// reset user
		res.send('not_found');
		return;
	}
	const access_token = await wxUtil.getAccessTokenByHid(hid);
	msgs.forEach(async msg => {
		// send one by one
		await _sendClientMessage(openid, {
			title: msg.title,
			description: msg.description,
			url: msg.url,
			picurl: msg.picurl
		}, access_token)
		.then((result) => {
			if (result.data && result.data.errcode === 0) {
				// save to message log for later retry
				removeFromMsgQueue(openid, result.data.url, result.data.hid);
			}
		})
		.catch(err => next(err));
	})
	res.send('resent');
}

module.exports = {
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
			// 微信服务器传过来的是xml格式的，是buffer类型，因为js本身只有字符串数据类型，所以需要通过toString把xml转换为字符串
			buffer.push(data);
		});
		req.on('end', async function () {
			const msgXml = Buffer.concat(buffer).toString('utf-8');
			try {
				const r = await messageHandler.msgHandler(msgXml);
				res.send(r);
			} catch (error) {
				res.send('error');
			}
		});


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
		const access_token = await wxUtil.getAccessTokenByHid(req.token.hid);
		const data = {
			action_name: 'QR_LIMIT_STR_SCENE',
			action_info: {
				scene: {
					scene_str: did
				}
			}
		};
		axios.post('https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=' + access_token,
			data,
			{
				params: {
					access_token: access_token,
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
	sendBookingTemplateMessage,
	sendClientMessage,
	removeFromMsgQueue,
	resendFailedMsg,

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

}