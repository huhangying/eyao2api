const wxUtil = require('./wx-util');
const axios = require('axios').default;
const util = require('../util/util');

/**
 * 参与签名数据 jsapi_ticket、timestamp、nonceStr、url 字典排序；
 *  @param args 将参与签名的对象排序 参数；
 */
function raw(args) {
  let keys = Object.keys(args); //获取json对象 的key值，并存在数组里；
  keys = keys.sort();

  let string = '';
  keys.forEach((val) => {
    string += '&' + val + '=' + args[val];
  });
  string = string.substr(1);
  return string;
}

module.exports = {
  getJsapiConfig: async (req, res, next) => {
    const { url } = req.query;
    const access_token = await wxUtil.getAccessTokenByHid(req.token.hid);

    axios.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`)
      .then((result) => {
        if (!result || !result.data || !result.data.ticket) {
          return Status.returnStatus(res, Status.FAILED)
        }
        const jsapi_ticket = result.data.ticket;
        let ret = {
          jsapi_ticket: jsapi_ticket,
          nonceStr: util.nonceStr(),
          timestamp: util.timestamp(),
          url: url
        };
        const str = raw(ret)
        let sha1 = crypto.createHash('sha1');
        sha1.update(str);
        ret.signature = sha1.digest('hex');

        return res.json(ret);
      })
      .catch(err => next(err));
  },


}