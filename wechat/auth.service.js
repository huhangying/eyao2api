const axios = require('axios').default;
const util = require('../util/util');
const { Buffer } = require('buffer');
const messageHandler = require('./message-handler');
const wxUtil = require('./wx-util');
const wxMsgQueue = require('../db/model/wxMsgQueue');
const User = require('../db/model/user');

// 微信消息支持两种：微信模板消息 和 微信文章消息

// type=微信模板消息，用于发送门诊预约取消和前转
const sendWechatTemplateMessage = async (req, res, next) => {
	const { openid, hid, bookingid, data, templateid, forwardbookingid, doctorid, username } = req.body;

	const access_token = await wxUtil.getAccessTokenByHid(hid);
	const { wxurl } = await wxUtil.getHospitalSettingsByHid(hid);
	const template_id = await wxUtil.getWechatTemplateIdByHid(hid, templateid);
	const url = !forwardbookingid ?
		wxurl + 'reservation?openid=' + openid + '&state=' + hid + '&id=' + bookingid :
		wxurl + 'booking-forward?openid=' + openid + '&state=' + hid + '&id=' + bookingid + '|' + forwardbookingid;
	const sendBody = {
		touser: openid,
		template_id: template_id,
		url: url,
		data: data
	};
	axios.post('https://api.weixin.qq.com/cgi-bin/message/template/send',
		sendBody,
		{
			params: {
				access_token: access_token
			}
		})
		.then((result) => {
			checkWxResponse(openid, hid, result.data, sendBody, doctorid, username);
			return res.json(result.data)
		})
		.catch(err => next(err));
}

// type=微信文章消息
// article: {
// 		title: title,
// 		description: description,
// 		url: url,
// 		picurl: picUrl
// }
const sendClientMessage = async (req, res, next) => {
	const { openid } = req.params;
	const { hid, article, doctorid, username } = req.body;
	const access_token = await wxUtil.getAccessTokenByHid(hid);
	axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send',
		{
			touser: openid,
			msgtype: 'news',
			news: {
				articles: [article] // 现只支持一篇文章
			}
		},
		{
			params: {
				access_token: access_token
			}
		})
		.then((result) => {
			checkWxResponse(openid, hid, result.data, article, doctorid, username);

			return res.json(result.data)
		})
		.catch(err => next(err));
}

const checkWxResponse = (openid, hid, rspData, sendBody, doctorid, username) => {
	if (rspData && rspData.errcode) {
		// if (rspData) { // test
		if (rspData.errcode === 40001) {
			// 40001:	获取 access_token 时 AppSecret 错误，或者 access_token 无效
			wxUtil.refreshAccessToken(hid); // 本次失败，不能重试，只能等下次
		}
		if (!sendBody) return;

		// save to message log for later retry
		const msg = {
			...sendBody, // sendBody 是 object
			type: !sendBody.template_id ? 1 : 2, // 1: 微信图文消息; 2: 微信模板消息
			errcode: rspData.errcode,
			hid: hid,
			openid: openid,
			received: false,
			doctorid,
			username,
		};

		add2MsgQueue(msg);
	}
}

const add2MsgQueue = (data) => {
	// console.log('failed queue', data);
	wxMsgQueue.create(data)
		.then(async (result) => {
			// mark in user table
			await User.findOneAndUpdate({ link_id: result.openid, hid: result.hid, apply: true },
				{ $inc: { msgInQueue: 1 }, updated: new Date() });
		});
}

// 消息重新发送成功
const removeFromMsgQueue = (msgId, openid, hid) => {
	// 
	return wxMsgQueue.findByIdAndDelete(msgId)
		.then((result) => {
			if (result) {
				// mark in user table
				User.findOneAndUpdate({ link_id: openid, hid: hid, apply: true },
					{ $inc: { msgInQueue: -1 }, updated: new Date() })
					.exec();
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
	let successCount = 0;
	let failedCount = 0;
	const promises = [];
	msgs.reverse().slice(0, 1).forEach(async msg => {
		// send one by one, and by types (text and template)
		promises.push(axios.post('https://api.weixin.qq.com/cgi-bin/message/custom/send',
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
			.then(async (result) => {
				if (result.data) {
					if (result.data.errcode === 0) {
						// save to message log for later retry
						await removeFromMsgQueue(msg._id, openid, msg.hid);
						successCount++;
					} else {
						// failed and increase tryCount
						await wxMsgQueue.findByIdAndUpdate(msg._id, { $inc: { tryCount: 1 } }, { new: true }).then((result) => {
							console.log(result);
						});
						failedCount++;
					}
				}
			})
			.catch(err => next(err))
		);
	});
	await Promise.all(promises);
	res.json({ return: `resent: (success: ${successCount} failed: ${failedCount})` });
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