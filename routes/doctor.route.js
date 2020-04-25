//---------------- 药师注册
const router = require('express').Router();
var Doctor = require('../db/controller/doctor');

router.route('/doctors/:number')
    .get(Doctor.GetAllDoctors);//
router.route('/doctors/:number/all')
    .get(Doctor.GetAll);//

router.route('/doctors/notfocus/:user')
    .get(Doctor.GetAllNotFocus);//

router.route('/doctors/find/:number/:skip')
    .get(Doctor.GetAndSkip);//

router.route('/doctor/cell/:cell')
    .get(Doctor.GetByCell);
router.route('/doctor/userid/:userid')
    .get(Doctor.GetByUserId);

router.route('/doctor/:id')
    .get(Doctor.GetById)
    .delete(Doctor.DeleteByUserId)
    .post(urlencodedParser, Doctor.AddByUserId)
    .patch(urlencodedParser, Doctor.UpdateByUserId);

router.route('/doctors/department/:departmentid')
    .get(Doctor.GetByDepartmentId);//

router.route('/login/doctor')
    .patch(urlencodedParser, Doctor.Login);
router.route('/doctor/passwd/:did')
    .get(Doctor.GetPassword);//

// 药师快捷回复
router.route('/doctor/shortcuts/:did')
    .get(Doctor.GetShortcuts)
    .patch(urlencodedParser, Doctor.UpdateShortcuts);
// 药师的基本信息:
router.route('/doctor/brief/:did')
    .get(Doctor.GetBriefInfo);//