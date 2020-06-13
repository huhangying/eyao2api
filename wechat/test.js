const dealTextMessage = (msgType, toUserName, fromUserName, msgId, createTime, content, cb) => {
  const timestamp = (new Date()).getTime(); const responseContent = '文字';
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}
const dealImageMessage = (msgType, toUserName, fromUserName, msgId, createTime, picUrl, mediaId, cb) => {
  const timestamp = (new Date()).getTime();
  const responseContent = '图片';
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}
const dealVoiceMessage = (msgType, toUserName, fromUserName, msgId, createTime, mediaId, format, recognition, cb) => {
  const timestamp = (new Date()).getTime();
  const responseContent = '声音 > ' + recognition;
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}
const dealVideoMessage = (msgType, toUserName, fromUserName, msgId, createTime, mediaId, thumbMediaId, cb) => {
  const timestamp = (new Date()).getTime();
  const responseContent = '视频';
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}
const dealShortVideoMessage = (msgType, toUserName, fromUserName, msgId, createTime, mediaId, thumbMediaId, cb) => {
  const timestamp = (new Date()).getTime();
  const responseContent = '短视频';
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}
const dealLocationMessage = (msgType, toUserName, fromUserName, msgId, createTime, location_X, location_Y, scale, label, cb) => {
  const timestamp = (new Date()).getTime();
  const responseContent = '位置';
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}
const dealLinkMessage = (msgType, toUserName, fromUserName, msgId, createTime, title, description, url, cb) => {
  const timestamp = (new Date()).getTime();
  const responseContent = '链接';
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}
const dealSubscribeMessage = (msgType, toUserName, fromUserName, createTime, eventKey, cb) => {
  const timestamp = (new Date()).getTime();
  const responseContent = '你好哇~';
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}
const dealUnsubscribeMessage = (msgType, toUserName, fromUserName, createTime, eventKey, cb) => {
  const timestamp = (new Date()).getTime();
  const responseContent = '取消关注';
  const result = ` ${fromUserName} ${toUserName} ${timestamp} text ${responseContent} `;
  cb(result);
}

const dealReceiveMessage = (xmlString, cb) => {
  const result = xmlString['xml'];
  // console.log(result); 
  const msgType = result.MsgType[0];
  const toUserName = result.ToUserName[0];
  const fromUserName = result.FromUserName[0];
  const createTime = result.CreateTime[0];
  const msgId = result.MsgId && result.MsgId[0];
  let mediaId;
  let thumbMediaId;
  switch (msgType) {
    case 'text':
      const content = result.Content[0];
      dealTextMessage(msgType, toUserName, fromUserName, msgId, createTime, content, cb);
      break;
    case 'image':
      const picUrl = result.PicUrl[0];
      mediaId = result.MediaId[0];
      dealImageMessage(msgType, toUserName, fromUserName, msgId, createTime, picUrl, mediaId, cb);
      break;
    case 'voice':
      mediaId = result.MediaId[0];
      const format = result.Format[0];
      const recognition = result.Recognition[0];
      dealVoiceMessage(msgType, toUserName, fromUserName, msgId, createTime, mediaId, format, recognition, cb);
      break;
    case 'video':
      mediaId = result.MediaId[0];
      thumbMediaId = result.ThumbMediaId[0];
      dealVideoMessage(msgType, toUserName, fromUserName, msgId, createTime, mediaId, thumbMediaId, cb); 
      break;
    case 'shortvideo':
      mediaId = result.MediaId[0];
      thumbMediaId = result.ThumbMediaId[0];
      dealShortVideoMessage(msgType, toUserName, fromUserName, msgId, createTime, mediaId, thumbMediaId, cb);
      break;
    case 'location':
      const location_X = result.Location_X[0];
      const location_Y = result.Location_Y[0];
      const scale = result.Scale[0];
      const label = result.Label[0];
      dealLocationMessage(msgType, toUserName, fromUserName, msgId, createTime, location_X, location_Y, scale, label, cb);
      break;
    case 'link':
      const title = result.Title[0];
      const description = result.Description[0];
      const url = result.Url[0];
      dealLinkMessage(msgType, toUserName, fromUserName, msgId, createTime, title, description, url, cb);
      break;
    case 'event':
      const event = result.Event[0];
      switch (event) {
        case 'subscribe':
          const eventKey = result.EventKey[0];
          dealSubscribeMessage(msgType, toUserName, fromUserName, createTime, eventKey, cb);
          break;
        case 'unsubscribe':
          const eventKey = result.EventKey[0];
          dealUnsubscribeMessage(msgType, toUserName, fromUserName, createTime, eventKey, cb);
          break;
      }
      break;
  }
}
// const wechat = express.Router();
// wechat.use((req, res, next) => {
//   tools.checkWechatServer(req.ip, (state) => {
//     if (!state) {
//       res.send('吼！帅华表示然并卵！！');
//       console.log('吼！帅华表示然并卵！！');
//       return;
//     } next();
//   });
// });
// wechat.use('/', (req, res) => {
//   const body = '';
//   req.on('data', (d) => { body += d; });
//   req.on('end', () => {
//     const parseString = xml.parseString;
//     parseString(body, function (err, result) {
//       dealReceiveMessage(result, (responseXML) => {
//         res.send(responseXML);
//       });
//     });
//   });
// });