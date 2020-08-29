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

const sendWechatTemplateMessage = async (req, res, next) => {
	const { openid, hid, bookingid, data, templateid, forwardbookingid } = req.body;

	const access_token = await wxUtil.getAccessTokenByHid(hid);
	const { wxurl } = await wxUtil.getHospitalSettingsByHid(hid);
	const template_id = await wxUtil.getWechatTemplateIdByHid(hid, templateid);
	const url = !forwardbookingid ?
		wxurl + 'reservation?openid=' + openid + '&state=' + hid + '&id=' + bookingid :
		wxurl + 'wechat/booking-forward?openid=' + openid + '&state=' + hid + '&id=' + bookingid + '|' + forwardbookingid;
	axios.post('https://api.weixin.qq.com/cgi-bin/message/template/send',
		{
			touser: openid,
			template_id: template_id,
			url: url,
			data: data
		},
		{
			params: {
				access_token: access_token
			}
		})
		.then((result) => {
			checkWxResponse(openid, hid, result.data);
			return res.json(result.data)
		})
		.catch(err => next(err));
}

// System send it out
const sendClientMessage = async (req, res, next) => {
	const { openid } = req.params;
	const { hid, article } = req.body;
	const access_token = await wxUtil.getAccessTokenByHid(hid);
	axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send',
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
		})
		.then((result) => {
			checkWxResponse(openid, hid, result.data, article);

			return res.json(result.data)
		})
		.catch(err => next(err));
}

const checkWxResponse = (openid, hid, rspData, sendBody) => {
	if (rspData && rspData.errcode) {
		if (rspData.errcode === 40001) {
			// 40001:	获取 access_token 时 AppSecret 错误，或者 access_token 无效
			wxUtil.refreshAccessToken(hid); // 本次失败，不能重试，只能等下次
		}
		if (!sendBody) return;
		// save to message log for later retry
		const msg = !sendBody.url ?
			{
				openid: openid,
				url: sendBody, // sendBody 自己是 url
				hid: hid,
			} :
			{
				...sendBody, // sendBody 是 article object
				type: 2,
				errcode: rspData.errcode,
				hid: hid,
				openid: openid,
				received: false,
			};

		save2MsgQueue(msg);
	}
}

const save2MsgQueue = (data) => {
	wxMsgQueue.findOneAndUpdate({ openid: data.openid, url: data.url, hid: data.hid }, data, { upsert: true, new: true })
		.then(async (result) => {
			if (!result.tryCount) { // if first time
				// mark in user table
				await User.findOneAndUpdate({ link_id: result.openid, hid: result.hid, apply: true },
					{ $inc: { msgInQueue: 1 }, updated: new Date() });
				result.tryCount = 1;
			} else {
				result.tryCount++;
			}
			await result.save();
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
		res.json({ return: 'not_found' });
		return;
	}
	const access_token = await wxUtil.getAccessTokenByHid(hid);
	msgs.forEach(async msg => {
		// send one by one
		axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send',
			{
				touser: openid,
				msgtype: 'news',
				news: {
					articles: [{
						title: msg.title,
						description: msg.description,
						url: msg.url,
						picurl: msg.picurl
					}]
				}
			},
			{
				params: {
					access_token: access_token
				}
			})
			.then((result) => {
				if (result.data) {
					if (result.data.errcode === 0) {
						// save to message log for later retry
						removeFromMsgQueue(openid, msg.url, msg.hid);
					} else {
						checkWxResponse(openid, hid, result.data, msg.url);
					}
				}
			})
			.catch(err => next(err));
	})
	res.json({ return: 'resent' });
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
				res.send(JSON.stringify(error)); // error
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
	sendWechatTemplateMessage,
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