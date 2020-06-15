const axios = require('axios').default;
const Hospital = require('../db/model/hospital');
const AccessToken = require('./access-token.model');

const getHidByWxid = async (wxid) => {
  const hospital = await Hospital.findOne({ wxid: wxid, apply: true })
    .select('hid');
  return hospital.hid;
}

const getWechatAccessToken = async (hid) => {
  // 1. get secret
  const secret = await Hospital.getSecretByHid(hid);

  // 2. get access_token
  return axios.get('https://api.weixin.qq.com/cgi-bin/token', {
    params: {
      appid: secret.appid,
      secret: secret.secret,
      grant_type: 'client_credential'
    }
  });
}

// 根据hid获取 access_token
const getAccessTokenByHid = async (hid) => {
  const token = await AccessToken.findOne({ hid: hid });

  if (!token || token.expires_time < new Date().getTime()) {
    const newToken = await refreshAccessToken(hid);
    return newToken.access_token;
  } else {
    return token.access_token;
  }
}

const refreshAccessToken = async (hid) => {
  const token = await getWechatAccessToken(hid);
  return AccessToken.findOneAndUpdate(
    { hid: hid },
    {
      access_token: token.data.access_token,
      expires_time: new Date().getTime() + (7200 - 60) * 1000,
      hid: hid
    },
    { new: true, upsert: true }
  );
}

const getUserInfo = (openid, access_token) => {
  // subscribe参数判断是否已经关注：0-未关注，1-已关注
  return axios.get('https://api.weixin.qq.com/cgi-bin/user/info', {
    params: {
      access_token: access_token,
      openid: openid,
      lang: 'zh_CN'
    }
  });
}

module.exports = {
  getHidByWxid,
  getAccessTokenByHid,
  getWechatAccessToken,
  refreshAccessToken,
  
  getUserInfo,
}