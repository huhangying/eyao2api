const User = require('../db/model/user');
const Doctor = require('../db/model/doctor');
const wxUtil = require('./wx-util');

const { Parser } = require('xml2js');
const { Builder } = require('xml2js');
const parser = new Parser({ trim: true, explicitArray: false, explicitRoot: false });
const builder = new Builder({ headless: true, cdata: true, explicitRoot: false, rootName: 'xml' });

const msgHandler = (msgbufer) => {
  let data, baseData, helpTxt, userInfo;
  
  return new Promise((resolve, reject) => {
    parser.parseString(msgbufer.toString(), async (err, result) => {
      if (err) {
        reject({
          code: -1,
          msg: 'error',
          data: err,
        });
      }
      baseData = {
        ToUserName: result.FromUserName,
        FromUserName: result.ToUserName,
        CreateTime: Date.now(),
      }

      switch (result.MsgType) {
        case 'text':
          switch (result.Content.toLowerCase()) {
            case 'help':
              // 返回帮助内容
              helpTxt = [
                '1. 在公众号对话框中输入任意商品名称，点击返回的链接即可筛选购买.',
                '2. 输入关键字『入口』可以得到网站的入口链接.'
              ]
              data = Object.assign({
                MsgType: 'text',
                Content: helpTxt.join('\n'),
              }, baseData);

              resolve(builder.buildObject(data));
              break;
            default:
              resolve('');
              break;
          }
          break;

        case 'event':
          switch (result.Event.toLowerCase()) {
            case 'scan':
              // 扫药师二维码加入
              userInfo = await register(result.FromUserName, result.EventKey);

              data = Object.assign({
                MsgType: 'news',
                ArticleCount: 1,
                Articles: {
                  item: {
                    Title: userInfo.name,
                    Description: '丸子带你买，店内领取各种淘宝天猫优惠券',
                    PicUrl: 'http://weixin.tangsj.com/dataoke/wx.jpg',
                    Url: 'http://weixin.tangsj.com/dataoke/',
                  },
                },
              }, baseData);
              resolve(builder.buildObject(data));
              break;

            case 'subscribe':
              // 关注
              data = Object.assign({
                MsgType: 'news',
                ArticleCount: 1,
                Articles: {
                  item: {
                    Title: '淘淘乐',
                    Description: '丸子带你买，店内领取各种淘宝天猫优惠券',
                    PicUrl: 'http://weixin.tangsj.com/dataoke/wx.jpg',
                    Url: 'http://weixin.tangsj.com/dataoke/',
                  },
                },
              }, baseData);

              resolve(builder.buildObject(data));
              break;
            case 'unsubscribe':
              // 取消关注
              data = Object.assign({
                MsgType: 'text',
                Content: '在下没能满足客官的需求，实在抱歉~~',
              }, baseData);

              resolve(builder.buildObject(data));
              break;
          }
          resolve('');
          break;

        default:
          resolve('');
          break;
      }
    });
  });
}

const getUserInfo = async (openid, hid) => {
  const access_token = await wxUtil.getAccessTokenByHid(hid);
  return wxUtil.getUserInfo(openid, access_token);
} 

const register = async (openid, did) => {
  const doctor = await Doctor.findById(did);
  if (doctor && doctor) {
    const userInfo = await getUserInfo(openid, doctor.hid);
    console.log(userInfo);
    
    await User.findOneAndUpdate({link_id: openid, hid: doctor.hid}, {}, {upsert: true, new: true})
  }

}

const linkDoctor = (uid, did) => {

}

module.exports = {
  msgHandler,
  register,
}