const Booking = require('../db/model/booking');
const Chatroom = require('../db/model/chatroom');
const Diagnose = require('../db/model/diagnose');
const Group = require('../db/model/group');
const labResult = require('../db/model/labResult');
const Prescription = require('../db/model/prescription');
const Relationship = require('../db/model/relationship');
const Schedule = require('../db/model/schedule');
const Survey = require('../db/model/survey');
const UserFeedback = require('../db/model/userFeedback');
const Doctor = require('../db/model/doctor');
const ArticleTemplate = require('../db/model/articleTemplate');
const AdverseReaction = require('../db/model/adverseReaction');
const SurveyTemplate = require('../db/model/surveyTemplate');
const SurveyCat = require('../db/model/surveyCat');


const allowToDeleteUser = async (id, hid) => {
    let existed = true;
    try {
        existed = await Booking.exists({ user: id, hid: hid })
        if (existed) return false;

        existed = await Chatroom.exists({ user: id, hid: hid })
        if (existed) return false;

        existed = await Diagnose.exists({ user: id, hid: hid })
        if (existed) return false;

        existed = await labResult.exists({ user: id, hid: hid })
        if (existed) return false;

        existed = await Prescription.exists({ user: id, hid: hid })
        if (existed) return false;

        existed = await Relationship.exists({ user: id, hid: hid })
        if (existed) return false;

        existed = await Survey.exists({ user: id, hid: hid })
        if (existed) return false;

        existed = await UserFeedback.exists({ user: id, hid: hid })
        if (existed) return false;
    } catch (e) {
        return false;
    }
    return true;
};

const allowToDeleteDoctor = async (id, hid) => {
    let existed = true;
    try {
        existed = await Booking.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await Chatroom.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await Diagnose.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await Group.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await labResult.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await Prescription.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await Relationship.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await Schedule.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await Survey.exists({ doctor: id, hid: hid })
        if (existed) return false;

        existed = await UserFeedback.exists({ doctor: id, hid: hid })
        if (existed) return false;
    } catch (e) {
        return false;
    }
    return true;
};

const  allowToDeleteDepartment = async (id, hid) => {
    let existed = true;
    try {
      existed = await Doctor.exists({ department: id, hid: hid })
      if (existed) return false;

      existed = await ArticleTemplate.exists({ department: id, hid: hid })
      if (existed) return false;

      existed = await AdverseReaction.exists({ department: id, hid: hid })
      if (existed) return false;

      existed = await SurveyTemplate.exists({ department: id, hid: hid })
      if (existed) return false;

      existed = await SurveyCat.exists({ department: id, hid: hid })
      if (existed) return false;
    } catch (e) {
      return false;
    }

    return true;
  };

module.exports = {
    allowToDeleteUser,
    allowToDeleteDoctor,
    allowToDeleteDepartment,

}