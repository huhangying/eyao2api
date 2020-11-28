const tenpay = require('tenpay');
// const tenpay = require('./lib/tenpay/index');
const wxUtil = require('./wx-util');
const utf8 = require('utf8');
const { Parser } = require('xml2js');
const parser = new Parser({ trim: true, explicitArray: false, explicitRoot: false });

const payApi = async (hid) => {
  // const clientIp = req.headers['x-real-ip'] || req.connection.remoteAddress.split(':').pop();
  // config
  const { appid, mch_id, partnerKey, notify_url, server_ip } = await wxUtil.getHospitalSettingsByHid(hid);
  const config = {
    appid: appid,
    mchid: mch_id,
    partnerKey: partnerKey, // 微信支付安全密钥
    // pfx: require('fs').readFileSync('./wechat/lib/apiclient_cert.p12'), // 证书文件路径
    notify_url: notify_url, // 支付回调网址
    spbill_create_ip: server_ip, // 服务器IP地址
  };
  // return tenpay.init(config);
  return tenpay.init(config, true);
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
  parser.parseString(req.body, (err, result) => {
    if (err || result.return_code === 'FAIL') {
      // 错误处理
      console.log('error: ', err, result);
      return res.reply('');
    }
    // 业务逻辑...
    console.log(result);
    // 回复消息(参数为空回复成功, 传值则为错误消息)
    res.reply('错误消息' || '');
  });
}

// 微信统一下单/自动下单
const unifiedOrder = async (req, res, next) => {
  const { openid, hid, out_trade_no, total_fee, body, attach } = req.body;
  const api = await payApi(hid);
  api.getPayParams({
    body: body,// 商品描述
    // body: utf8.encode(body),// 商品描述
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

// 申请退款
const refund = async (req, res, next) => {
  const { hid, orderId, amount, refundId, refundAmount } = req.body;
  const api = await payApi(hid);
  api.refund({
    out_trade_no: orderId,    // 商户内部订单号
    out_refund_no: refundId,  // 商户内部退款单号
    total_fee: amount,
    refund_fee: refundAmount
  })
    .then((result) => {
      return res.json(result.data)
    })
    .catch(err => next(err));
}

// 查询订单
const orderQuery = async (req, res, next) => {
  const { hid, orderId } = req.body;
  const api = await payApi(hid);
  api.orderQuery({
    out_trade_no: orderId, // '商户内部订单号',
  })
    .then((result) => {
      return res.json(result.data)
    })
    .catch(err => next(err));
}
// 撤消订单
const reverse = async (req, res, next) => {
  const { hid, orderId } = req.body;
  const api = await payApi(hid);
  api.reverse({
    out_trade_no: orderId, // '商户内部订单号',
  })
    .then((result) => {
      return res.json(result.data)
    })
    .catch(err => next(err));
}
// 查询关闭订单
const closeOrder = async (req, res, next) => {
  const { hid, orderId } = req.body;
  const api = await payApi(hid);
  api.closeOrder({
    out_trade_no: orderId, // '商户内部订单号',
  })
    .then((result) => {
      return res.json(result.data)
    })
    .catch(err => next(err));
}

module.exports = {
  middlewareForExpress,
  notify,
  unifiedOrder,
  refund,
  orderQuery,
  reverse,
  closeOrder,
}
