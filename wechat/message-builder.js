const { Builder } = require('xml2js');
const builder = new Builder({ headless: true, cdata: true, explicitRoot: false, rootName: 'xml' });

const payNotifyResponse = (notifyRsp) => {
  return builder.buildObject(notifyRsp);
}

const textMessage = (baseData, text) => {
  return builder.buildObject(
    Object.assign({
      MsgType: 'text',
      Content: text,
    }, baseData)
  );
}

const newsMessage = (baseData, title, description, picUrl, url) => {
  return builder.buildObject(
    Object.assign({
      MsgType: 'news',
      ArticleCount: 1,
      Articles: {
        item: {
          Title: title,
          Description: description,
          PicUrl: picUrl,
          Url: url,
        },
      },
    }, baseData)
  );
}

const newsMessages = (baseData, title, description, picUrl, url) => {
  const items = buildMessageItemStr(title, description, picUrl, url) + buildMessageItemStr('多图文2标题', 'description+2', 'http://www.zhaoyaoshi885.cn:888/1/template/584c1a21e4a25347fecc9847_titlenwIfGKT2op.png', 'http://www.zhaoyaoshi885.cn:888/1/template/584c1a21e4a25347fecc9847_titlenwIfGKT2op.png');
  console.log(items);
  return `<xml>
<ToUserName><![CDATA[${baseData.ToUserName}]]></ToUserName>
<FromUserName><![CDATA[${baseData.FromUserName}]]></FromUserName>
<CreateTime>${baseData.CreateTime}</CreateTime>
<MsgType><![CDATA[news]]></MsgType>
<ArticleCount>${2}</ArticleCount>
<Articles>${items}</Articles>
</xml>`;
}

const buildMessageItemStr = (title, description, picUrl, url) => {
  return `<item>
  <Title><![CDATA[${title}]]></Title>
  <Description><![CDATA[${description}]]></Description>
  <PicUrl><![CDATA[${picUrl}]]></PicUrl>
  <Url><![CDATA[${url}]]></Url>
</item>`;
}

const subscribeMessage = (baseData) => {
  return builder.buildObject(
    Object.assign({
      MsgType: 'event',
      Event: 'subscribe'
    }, baseData)
  );
}

const subscribeMessageWithDoctor = (baseData, did, ticket) => {
  return builder.buildObject(
    Object.assign({
      MsgType: 'event',
      Event: 'subscribe',
      EventKey: did,
      Ticket: ticket
    }, baseData)
  );
}

module.exports = {
  textMessage,
  newsMessage,
  newsMessages,
  subscribeMessage,
  subscribeMessageWithDoctor,

  payNotifyResponse,
}