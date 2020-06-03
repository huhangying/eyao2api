const Signature = require('./signature.model');

module.exports = {

  // 根据openid获取详细信息
  GetByOpenId: (req, res, next) => {
    const { openid } = req.params;
    Signature.findOne({ openid: openid, hid: req.token.hid })
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // Add or Update
  Upsert: (req, res, next) => {
    const signature = req.body;
    if (!signature.openid) {
      return Status.returnStatus(res, Status.MISSING_PARAM);
    }
    Signature.findOneAndUpdate(
      { open: signature.openid, hid: signature.hid },
      signature,
      { new: true, upsert: true })
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // should never use
  DeleteById: (req, res, next) => {
    const { id } = req.params;
    Signature.findByIdAndDelete(id)
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

}