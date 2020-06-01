const router = require('express').Router();

///////////////////////////////////////////////////////////////////////////////////
const wechat = require('../wechat/sign');

router.route('/wechat/signature')
    .get(wechat.signatureTest)
    .post(wechat.signatureAuth);
router.route('/wechat/checkSignature')
    .get(wechat.checkSignature);

module.exports = router;
