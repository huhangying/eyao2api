/**
 * Created by hhu on 2018/5/31.
 */

const Hospital = require('../model/hospital.js');

module.exports = {

  // ONLY one don't need HID
  GetAll: (req, res, next) => {
    Hospital.find({ hid: req.token.hid })
      .select('-__v')
      .lean()
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // 获取药师APP医院列表 (app side)
  // return: [{name, hid}]
  GetAppHospitals: (req, res, next) => {
    Hospital.find({ apply: true })
      .select('name hid')
      .lean()
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // 获取药师APP医院列表 (web side)
  // 如果访问的domain在ipList中，返回单个；
  // 如果访问的domain不在ipList中，返回所有；
  // return: [{name, hid}]
  GetWebHospitals: (req, res, next) => {
    Hospital.find({ apply: true })
      .select('name hid ipList')
      .lean()
      .then((results) => {
        const filteredList = results.filter(_ => _.ipList.indexOf(req.hostname));
        if (filteredList && filteredList.length > 0) {
          res.json(filteredList.map(_ => { return { name: _.name, hid: _.hid }; }));
        } else {
          res.json(results.map(_ => { return { name: _.name, hid: _.hid }; }));
        }
      })
      .catch(err => next(err));
  },

  // 根据ID获取详细信息
  GetById: (req, res, next) => {
    const { id } = req.params;
    Hospital.findById(id)
      .select('-__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // 根据HID获取详细信息
  GetByHid: (req, res, next) => {
    const { hid } = req.params;
    Hospital.find({ hid: hid, apply: true })
      .select('-__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  GetCustomerService: (req, res, next) => {
    Hospital.findOne({ hid: req.token.hid, apply: true })
      .select('_id csdoctor')
      .populate({
        path: 'csdoctor',
        // populate: { path: 'department', select: '_id name' },
        select: '-hid -__v',

      })
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  UpdateCustomerService: (req, res, next) => {
    const { id } = req.params;
    const { csdoctor } = req.body;
    Hospital.findByIdAndUpdate(id, { csdoctor: csdoctor }, { new: true })
      .select('csdoctor')
      .populate({
        path: 'csdoctor',
        // populate: { path: 'department', select: '_id name' },
        select: '-hid -__v',
      })
      .then((result) => res.json(result.csdoctor))
      .catch(err => next(err));
  },

  getWechatSecretByHid: (req, res, next) => {
    const { hid } = req.params;
    return Hospital.findOne({ hid: hid, apply: true })
      .select('appid secret')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // 创建医院
  Add: (req, res, next) => {
    const hospital = req.body;
    // name
    if (!hospital.name) {
      return Status.returnStatus(res, Status.NO_NAME);
    }
    // hid
    if (!hospital.hid) {
      return Status.returnStatus(res, Status.NO_HID);
    }
    Hospital.findOne({ name: hospital.name, hid: hospital.hid }) // check if existed
      .then((result) => {
        // 如果存在，直接返回
        if (result) return Status.returnStatus(res, Status.EXISTED);

        Hospital.create(hospital)
          .then((result) => res.json(result))
          .catch(err => next(err));
      })
      .catch(err => next(err));
  },

  UpdateById: (req, res, next) => {
    const { id } = req.params;
    Hospital.findByIdAndUpdate(id, req.body, { new: true })
      .select('-__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  // should never use
  DeleteById: (req, res, next) => {
    const { id } = req.params;
    Hospital.findByIdAndDelete(id)
      .select('-__v')
      .then((result) => res.json(result))
      .catch(err => next(err));
  },

  /////////////////////////////////////////////////////
  // Functions belows
  getHidByHost(host) {
    return Hospital.findOne({ ipList: host, apply: true })
      .select('hid name wxurl csdoctor server_ip');
  },
  getByHid(hid) {
    return Hospital.findOne({ hid: hid, apply: true })
      .select('hid name wxurl csdoctor server_ip');
  },

  getHidByWxid(wxid) {
    return Hospital.findOne({ wxid: wxid, apply: true })
      .select('hid name wxurl server_ip');
  },

  //======================= Seeding ==========================
  seeding: (req, res, next) => {
    const { hid } = req.params;
    const item = req.body;
    if (!item) {
      return Status.returnStatus(res, Status.MISSING_PARAM);
    }
    Hospital.exists({ hid: hid }).then(result => {
      if (result) return Status.returnStatus(res, Status.EXISTED);

      const itemsWithHid = Object.assign({ hid }, item);
      Hospital.create(itemsWithHid)
        .then((result) => res.json(result))
        .catch(err => next(err));
    });
  }

}