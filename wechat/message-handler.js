const User = require('../db/model/user');
const Doctor = require('../db/model/doctor');
const Relationship = require('../db/model/relationship');
const wxUtil = require('./wx-util');
const messageBuilder = require('./message-builder');
const { Parser } = require('xml2js');
const parser = new Parser({ trim: true, explicitArray: false, explicitRoot: false });

const msgHandler = (msgbufer) => {
  let baseData, helpTxt, user, msg;

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
              resolve(messageBuilder.textMessage(helpTxt.join('\n'), baseData));
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
              msg = await register(result.FromUserName, result.EventKey, result.Ticket);
              // success
              resolve(msg);
              break;

            case 'subscribe':
              // 关注
              resolve(messageBuilder.textMessage(
                '欢迎关注！\n为了更好的服务您，请点击‘个人中心’菜单设置详细的资料。',
                baseData
              ));
              break;
            case 'unsubscribe':
              // 取消关注
              resolve(messageBuilder.textMessage(
                '很遗憾您取消关注。欢迎重新关注我们。',
                baseData
              ));
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

const register = async (openid, did, ticket, baseData) => {
  let user;
  const doctor = await Doctor.findById(did);
  if (doctor && doctor.hid) {
    user = await User.findOne({ link_id: openid, hid: doctor.hid, apply: true });
    if (!user || !user._id) {
      const userInfo = await getUserInfo(openid, doctor.hid);
      // console.log(userInfo);
      if (userInfo.data && userInfo.data.subscribe) {
        const gender = userInfo.data.sex === 1 ? 'M' :
          (userInfo.data.sex === 2 ? 'F' : '');
        user = await User.findOneAndUpdate(
          { link_id: openid, hid: doctor.hid },
          {
            link_id: openid,
            hid: doctor.hid,
            name: userInfo.data.nickname,
            gender: gender,
            icon: userInfo.data.headimgurl,
            apply: true,
            created: new Date(),
            updated: new Date()
          },
          { upsert: true, new: true }
        );
      }
    }
    // link to the doctor
    if (user && user._id) {
      await Relationship.findOneAndUpdate({ user: user._id, doctor: did },
        { user: user._id, doctor: did, hid: doctor.hid, apply: true },
        { upsert: true }
      );
    }
  } else {
    // no doctor
    return messageBuilder.subscribeMessage(baseData);
  }
  if (user && user._id) {
    return messageBuilder.textMessage('欢迎关注公众号和药师！\n为了更好的服务您，请点击‘个人中心’菜单设置详细的资料。', baseData);
  } else {
    // 还未关注公众号
    return messageBuilder.subscribeMessageWithDoctor(doctor._id, ticket, baseData);
  }
}

module.exports = {
  msgHandler,
  register,
}