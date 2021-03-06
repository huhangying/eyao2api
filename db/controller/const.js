const Const = require('../model/const.js');
//todo: add caching functions

module.exports = {

  GetAll: (req, res, next) => {
    Const.find({ hid: req.token.hid })
      .select('-hid -__v')
      .lean()
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  //
  GetByName: (req, res, next) => {
    const { name } = req.params;
    const query = { name: name, hid: req.token.hid };
    Const.findOne(query)
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  getByGroup: (req, res, next) => {
    const { group } = req.params;
    Const.find({ group: group, hid: req.token.hid })
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // update: desc, type and value, but not name
  UpdateById: (req, res, next) => {
    const { id } = req.params;
    const _const = req.body;
    if (_const.name) { // name cannot be changed!
      delete _const.name;
    }
    Const.findByIdAndUpdate(id, _const, { new: true })
      .select('-hid -__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },


  /////////////////////////////////////////////////////////////////////////
  // 以下内部使用

  // by util/const.js
  _GetByName: function (_name) {
    return Const.findOne({ name: _name })
      .exec(function (err, item) {
        if (err || !item) {
          return '';
        }
        return item;
      });
  },

  // 创建 (Internal USE ONLY)
  Add: (req, res, next) => {
    const _const = req.body;
    // name
    if (!_const.name) {
      return Status.returnStatus(res, Status.NO_NAME);
    }
    Const.findOne({ name: _const.name, hid: _const.hid }) // check if existed
      .then((result) => {
        if (result) return Status.returnStatus(res, Status.EXISTED);

        Const.create(_const)
          .then((result) => res.json(result))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  },

  // (Internal USE ONLY)
  DeleteById: (req, res, next) => {
    const { id } = req.params;
    Const.findByIdAndDelete(id)
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  //======================= Seeding ==========================
  seeding: (req, res, next) => {
    const { hid } = req.params;
    const {items} = req.body;
    if (items.length < 1) {
      return Status.returnStatus(res, Status.MISSING_PARAM);
    }
    Const.exists({ hid: hid }).then(result => {
      if (result) return Status.returnStatus(res, Status.EXISTED);

      const itemsWithHid = items.map(item => Object.assign({ hid }, item));
      Const.insertMany(itemsWithHid)
        .then((result) => res.json(result))
        .catch(err => next(err));
    });
  }

}