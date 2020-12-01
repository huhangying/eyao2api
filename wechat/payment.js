const tenpay = require('tenpay');
const wxUtil = require('./wx-util');
// const utf8 = require('utf8');
const { Parser } = require('xml2js');
const parser = new Parser({ trim: true, explicitArray: false, explicitRoot: false });
const messageBuilder = require('./message-builder');
const Order = require('../db/controller/order');

const payApi = async (hid, withCert) => {
  // const clientIp = req.headers['x-real-ip'] || req.connection.remoteAddress.split(':').pop();
  // config
  const { appid, mch_id, partnerKey, notify_url, server_ip } = await wxUtil.getHospitalSettingsByHid(hid);
  const config = !withCert ? {
    appid: appid,
    mchid: mch_id,
    partnerKey: partnerKey, // 微信支付安全密钥
    notify_url: notify_url, // 支付回调网址
    spbill_create_ip: server_ip, // 服务器IP地址
  } : {
      appid: appid,
      mchid: mch_id,
      partnerKey: partnerKey, // 微信支付安全密钥
      pfx: require('fs').readFileSync('./wechat/lib/apiclient_cert.p12'), // 证书文件路径
      notify_url: notify_url, // 支付回调网址
      spbill_create_ip: server_ip, // 服务器IP地址
    };
  return tenpay.init(config);
  // return tenpay.init(config, true);
  // return await tenpay.sandbox(config);
}

// const middlewareForExpress = async() => {
const middlewareForExpress = async (req, res) => {
  const hid = req.body.hid;
  const api = await payApi(hid);
  return api.middlewareForExpress('pay');
}

// 回调通知 （中间件・微信消息通知）
// middleware参数: pay<支付结果通知, 默认> refund<退款结果通知> nativePay<扫码支付模式一回调>
// 需自行添加bodyParser接收post data
// 中间件会对通知消息进行合法性验证, 并将消息解析为json格式放入req.weixin
// reply()会自动封装SUCCESS消息, reply('some error_msg')会自动封装FAIL消息
const notify = (req, res) => {
  parser.parseString(req.body, async (err, result) => {
    if (err) {
      // 错误处理
      return res.send(messageBuilder.payNotifyResponse({ return_code: 'FAIL', return_msg: 'ERROR' }));
    } else if (result.return_code !== 'SUCCESS' || result.result_code !== 'SUCCESS') {
      return res.send(messageBuilder.payNotifyResponse({ return_code: 'FAIL', return_msg: result.return_msg }));
    } else if (!result.sign) {
      return res.send(messageBuilder.payNotifyResponse({ return_code: 'FAIL', return_msg: '' }));
    }

    let flag = true;
    let returnMsg = 'OK';
    const { partnerKey } = await wxUtil.getHospitalSettingsByHid(result.attach); // attach is hid
    const existingOrder = await Order.findOrder(result.openid, result.out_refund_no);
    if (!existingOrder) {
      flag = false;
      returnMsg = '不可识别的支付';
    } else {
      // 订单金额是否与商户侧的订单金额一致, 签名验证,
      if (existingOrder.amount != result.total_fee && !isSignValid(result, partnerKey)) {
        flag = false;
        returnMsg = '金额不一致或签名失败.';
      }
      // save back
      await Order.updateOrder(result.openid, result.out_trade_no, { ...result, return_msg: returnMsg });
    }

    res.send(messageBuilder.payNotifyResponse({ return_code: flag ? 'SUCCESS' : 'FAIL', return_msg: returnMsg }));
  });
}

// 微信统一下单/自动下单
const unifiedOrder = async (req, res, next) => {
  const { openid, hid, out_trade_no, total_fee, body, attach } = req.body;
  const api = await payApi(hid);
  const { name } = await wxUtil.getHospitalSettingsByHid(hid);
  api.getPayParams({
    body: name + body,// 商品描述
    out_trade_no, // 商户内部订单号
    total_fee,
    openid,
    attach
  })
    .then((result) => {
      return res.json(result)
    })
    .catch(err => next(err));
}

// 查询订单
const orderQuery = async (req, res, next) => {
  const { hid, out_trade_no } = req.body;
  const api = await payApi(hid);
  api.orderQuery({
    out_trade_no: out_trade_no, // '商户内部订单号',
  })
    .then((result) => {
      return res.json(result)
    })
    .catch(err => next(err));
}

// 关闭订单
const closeOrder = async (req, res, next) => {
  const { hid, out_trade_no } = req.body;
  const api = await payApi(hid);
  api.closeOrder({
    out_trade_no: out_trade_no, // '商户内部订单号',
  })
    .then((result) => {
      return res.json(result)
    })
    .catch(err => next(err));
}

// 撤消订单
const reverse = async (req, res, next) => {
  const { hid, out_trade_no } = req.body;
  const api = await payApi(hid, true);
  api.reverse({
    out_trade_no: out_trade_no, // '商户内部订单号',
  })
    .then((result) => {
      return res.json(result)
    })
    .catch(err => next(err));
}

// 申请退款
const refund = async (req, res, next) => {
  const { hid, out_trade_no, out_refund_no, total_fee, refund_fee } = req.body;
  const api = await payApi(hid, true);
  api.refund({
    out_trade_no: out_trade_no,    // 商户内部订单号
    out_refund_no: out_refund_no,  // 商户内部退款单号
    total_fee: total_fee,
    refund_fee: refund_fee
  })
    .then((result) => {
      return res.json(result)
    })
    .catch(err => next(err));
}

// 查询退款
const refundQuery = async (req, res, next) => {
  const { hid, out_trade_no } = req.body;
  const api = await payApi(hid);
  api.refundQuery({
    out_trade_no: out_trade_no,    // 商户内部订单号
  })
    .then((result) => {
      return res.json(result)
    })
    .catch(err => next(err));
}

// 下载对帐单
const downloadBill = async (req, res, next) => {
  const { hid, bill_date } = req.body;
  const api = await payApi(hid);
  api.downloadBill({
    bill_date: bill_date, // 对账单日期
  })
    .then((result) => {
      return res.json(result)
    })
    .catch(err => next(err));
}

// 下载资金帐单
const downloadFundflow = async (req, res, next) => {
  const { hid, bill_date } = req.body;
  const api = await payApi(hid);
  api.downloadFundflow({
    bill_date: bill_date, // '商户内部订单号',
  })
    .then((result) => {
      return res.json(result)
    })
    .catch(err => next(err));
}


// 验证调用返回或微信主动通知签名时，传送的sign参数不参与签名，将生成的签名与该sign值作校验
const isSignValid = (result, partnerKey) => {
  let data = Object.assign({}, result);
  const sign = data.sign;
  delete data.sign;
  let str = wxUtil.toQueryString(data) + '&key=' + partnerKey;
  return wxUtil.md5(str).toUpperCase() === sign;
}

module.exports = {
  middlewareForExpress,
  notify,
  unifiedOrder,
  orderQuery,
  closeOrder,
  reverse,
  refund,
  refundQuery,
  downloadBill,
  downloadFundflow,
}
