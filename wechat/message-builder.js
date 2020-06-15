const { Builder } = require('xml2js');
const builder = new Builder({ headless: true, cdata: true, explicitRoot: false, rootName: 'xml' });

const textMessage = (text, baseData) => {
  return builder.buildObject(
    Object.assign({
      MsgType: 'text',
      Content: text,
    }, baseData)
  );
}

const newsMessage = (title, description, picUrl, url, baseData) => {
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

const subscribeMessage = (baseData) => {
  return builder.buildObject(
    Object.assign({
      MsgType: 'event',
      Event: 'subscribe'
    }, baseData)
  );
}

const subscribeMessageWithDoctor = (did, ticket, baseData) => {
  return builder.buildObject(
    Object.assign({
      MsgType: 'event',
      Event: 'subscribe',
      EventKey: 'qrscene_' + did,
      Ticket: ticket
    }, baseData)
  );
}

module.exports = {
  textMessage,
  newsMessage,
  subscribeMessage,
  subscribeMessageWithDoctor,
}