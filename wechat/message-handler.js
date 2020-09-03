const User = require('../db/model/user');
const Relationship = require('../db/model/relationship');
const wxUtil = require('./wx-util');
const messageBuilder = require('./message-builder');
const { Parser } = require('xml2js');
const parser = new Parser({ trim: true, explicitArray: false, explicitRoot: false });

const msgHandler = (msgbufer) => {
  let baseData, helpTxt, msg;

  return new Promise((resolve, reject) => {
    parser.parseString(msgbufer.toString(), async (err, result) => {
      if (err) {
        reject({
          code: -1,
          msg: JSON.stringify(err), // 'error'
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
            case '?':
            case '帮助':
              // 返回帮助内容
              helpTxt = [
                '1. 在公众号对话框中输入...',
                '2. 输入关键字『todo』可以得到网站的入口链接.'
              ]
              resolve(messageBuilder.textMessage(baseData, helpTxt.join('\n')));
              break;

            case 'news':
              resolve(messageBuilder.newsMessage(baseData,
                '测试图文链接', 'XX药师给您发送了XXXX', 'http://www.zhaoyaoshi885.cn:888/1/template/584c1a21e4a25347fecc9847_titlenwIfGKT2op.png', 'http://www.zhaoyaoshi885.cn:888/1/template/584c1a21e4a25347fecc9847_titlenwIfGKT2op.png'));
              break;
            case 'link':
              resolve(messageBuilder.newsMessage(baseData,
                '测试链接', 'XX药师给您发送了XXXX', 'http://www.zhaoyaoshi885.cn/images/1/template/584c1a21e4a25347fecc9847_titlenwIfGKT2op.png'));
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
              console.log(result);
              msg = await scan(baseData, result.EventKey, result.Ticket);
              resolve(msg);
              break;

            case 'subscribe':
              // 关注
              console.log(result);
              msg = await subscribe(baseData, result.EventKey);
              resolve(msg);
              break;

            case 'unsubscribe':
              // 取消关注
              msg = await unsubscribe(baseData);
              resolve(msg);
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

const scan = async (baseData, did, ticket) => {
  did = did.replace('qrscene_', '');
  const openid = baseData.ToUserName;
  const hid = await wxUtil.getHidByWxid(baseData.FromUserName);
  const user = await User.findOne({ link_id: openid, hid: hid, apply: true });
  if (!user || !user._id) {
    return did ?
      messageBuilder.subscribeMessageWithDoctor(baseData, did, ticket) :
      messageBuilder.subscribeMessage(baseData);
  } else {
    return messageBuilder.textMessage(baseData, user.name + ', 欢迎回来！\n为了更好的服务您，请点击‘个人中心’菜单设置详细的资料。');
  }
}

const subscribe = async (baseData, did) => {
  did = did.replace('qrscene_', '');
  const openid = baseData.ToUserName;
  const hid = await wxUtil.getHidByWxid(baseData.FromUserName);
  const userInfo = await getUserInfo(openid, hid);
  // console.log(userInfo);
  if (userInfo.data && userInfo.data.subscribe) {
    const gender = userInfo.data.sex === 1 ? 'M' : (userInfo.data.sex === 2 ? 'F' : '');
    const user = await User.findOneAndUpdate(
      { link_id: openid, hid: hid },
      {
        link_id: openid,
        hid: hid,
        name: userInfo.data.nickname,
        gender: gender,
        icon: userInfo.data.headimgurl,
        role: 0,
        apply: true,
        created: new Date(),
        updated: new Date()
      },
      { upsert: true, new: true }
    );

    // link to the doctor
    if (did && user._id) {
      await Relationship.findOneAndUpdate(
        { user: user._id, doctor: did },
        { user: user._id, doctor: did, hid: hid, apply: true },
        { upsert: true }
      );
    }
    return messageBuilder.textMessage(baseData, '欢迎关注！\n为了更好的服务您，请点击‘个人中心’菜单设置详细的资料。');
  } else {
    // error ! it should not happen
    return messageBuilder.textMessage(baseData, 'Error');
  }
}

const unsubscribe = async (baseData) => {
  const openid = baseData.ToUserName;
  const hid = await wxUtil.getHidByWxid(baseData.FromUserName);
  // disable user in user and relationship tables
  const user = await User.findOneAndUpdate({ link_id: openid, hid: hid }, { apply: false });
  if (user && user._id) {
    await Relationship.updateMany({ user: user._id, hid: hid }, { apply: false });
  }
  return messageBuilder.textMessage(
    baseData,
    '很遗憾您取消关注。欢迎重新关注我们。'
  )
}

module.exports = {
  msgHandler,
}