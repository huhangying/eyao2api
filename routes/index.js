const express = require('express');
const router = express.Router();
// const bodyParser = require('body-parser');
const util = require('../util/util');
//通常 POST 内容的格式是 application/x-www-form-urlencoded, 因此要用下面的方式来使用
const bigFileUrlencodedParser = express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000000 });

router.use(util.verifyToken);

/* GET home page. */
router.route('/').get((req, res) => {
    res.render('index', { data: req.token });
});

//---------------- 用户注册
const User = require('../db/controller/user');

router.route('/users/search')
    .post(User.search);
router.route('/users/:number')
    .get(User.GetAll); //
router.route('/users/cms/:number')
    .get(User.GetAllCms);
router.route('/users/role/:role')
    .get(User.GetAllByRole);

router.route('/user/:id')
    .get(User.GetById)
    .patch(urlencodedParser, User.UpdateById)
    .delete(User.DeleteById); // for test

router.route('/user/cell/:cell')
    .get(User.GetByCell);

router.route('/user/wechat/:link_id')
    .get(User.GetByLinkId)
    .post(urlencodedParser, User.AddByLinkId)
    .patch(urlencodedParser, User.UpdateByLinkId);

router.route('/user/preset/wechat/:link_id')
    .post(urlencodedParser, User.AddPresetByLinkId);

router.route('/users/search') //GET
    .patch(urlencodedParser, User.Search)


//---------------- 药师注册
const Doctor = require('../db/controller/doctor');

router.route('/doctors/brief-list')
    .get(Doctor.GetDoctorList);//
router.route('/doctors/:number')
    .get(Doctor.GetAllDoctors);//
router.route('/doctors/search/:name')
    .get(Doctor.SearchDoctorsByName);//
router.route('/doctors/:number/all')
    .get(Doctor.GetAll);// CMS get all

router.route('/doctors/notfocus/:did')
    .get(Doctor.GetAllNotFocus);//

router.route('/doctors/find/:number/:skip')
    .get(Doctor.GetAndSkip);//

router.route('/doctors/department/:departmentid')
    .get(Doctor.GetByDepartmentId);//
router.route('/doctors/department/cms/:departmentid')
    .get(Doctor.CmsGetByDepartmentId);

router.route('/doctor/cell/:cell')
    .get(Doctor.GetByCell);

router.route('/doctor/userid/:userid')
    .get(Doctor.GetByUserId);

router.route('/doctor/:id')
    .get(Doctor.GetById)
    .delete(Doctor.DeleteById);

router.route('/doctor')
    .post(urlencodedParser, Doctor.Add)

router.route('/doctor/:userid')
    .patch(urlencodedParser, Doctor.UpdateByUserId);

router.route('/login/doctor')
    .patch(urlencodedParser, Doctor.Login);
router.route('/app-login/doctor')
    .patch(urlencodedParser, Doctor.AppLogin);

router.route('/doctor/passwd/:did')
    .get(Doctor.GetPassword);

// 药师快捷回复
router.route('/doctor/shortcuts/:did')
    .get(Doctor.GetShortcuts)
    .patch(urlencodedParser, Doctor.UpdateShortcuts);

// 药师的基本信息 
router.route('/doctor/brief/:id')
    .get(Doctor.GetBriefInfo);

//---------------- 付费咨询
const Consult = require('../db/controller/consult');

router.route('/consults')
    .get(Consult.GetAll);
router.route('/consults/search')
    .post(Consult.search);
router.route('/consults/get-pending/:did')
    .get(Consult.GetPendingByDoctorId);
router.route('/consults/get/:did/:uid')
    .get(Consult.GetConsultsByDoctorIdAndUserId);
// router.route('/consults/get-history/:did/:uid/:type')
//     .get(Consult.GetConsultsByDoctorIdUserIdAndType);
router.route('/consults/check-exists/:did/:uid')
    .get(Consult.CheckConsultExistedByDoctorIdAndUserId);
router.route('/consults/get-group/:consult') // for wechat (consult-reply)
    .get(Consult.GetConsultsByGroup);

router.route('/consults/mark-done/:did/:uid/:type')
    .get(Consult.MarkDoneByDoctorUserAndType);

router.route('/consult/:id')
    .get(Consult.GetById)
    .patch(urlencodedParser, Consult.UpdateById)
    .delete(Consult.DeleteById);

router.route('/consult/get-pending/:did/:uid')
    .get(Consult.GetPendingByDoctorIdAndUserId);
router.route('/consult/delete-pending/:did/:uid') // 删除多余的药师标记
    .delete(Consult.DeletePendingByDoctorIdAndUserId);

router.route('/consult')
    .post(urlencodedParser, Consult.Add);

//---------------- 药师 consult
const DoctorConsult = require('../db/controller/doctor-consult');

router.route('/doctor-consult/:doctor')
    .get(DoctorConsult.GetByDoctorId)
    .post(urlencodedParser, DoctorConsult.Update)
    .delete(DoctorConsult.DeleteByDoctorId);

//---------------- 药师 consult comment
const DoctorConsultComment = require('../db/controller/doctor-consult-comment');

router.route('/doctor-consult-comment/:doctor')
    .get(DoctorConsultComment.GetAllByDoctorId);
router.route('/doctor-consult-comment/consult/:cid') // get by consult id
    .get(DoctorConsultComment.GetByConsultId);
router.route('/doctor-consult-comment/:doctor/:from/:size')
    .get(DoctorConsultComment.GetByDoctorIdAndFromSize);

router.route('/doctor-consult-comment')
    .post(urlencodedParser, DoctorConsultComment.Add)
router.route('/doctor-consult-comment/:id')
    .delete(DoctorConsultComment.DeleteById);

//---------------- 医患关系组
const Group = require('../db/controller/group');

router.route('/groups')
    .get(Group.GetAll);
router.route('/groups/populated')
    .get(Group.GetAllPopulated);

router.route('/groups/doctor/:id')
    .get(Group.GetByDoctorId);

router.route('/group/:id')
    .get(Group.GetById)
    .patch(urlencodedParser, Group.UpdateById)
    .delete(Group.DeleteById);

router.route('/group')
    .post(urlencodedParser, Group.FindOrAdd);


//---------------- 医患关系
const Relationship = require('../db/controller/relationship');

router.route('/relationships')
    .get(Relationship.GetAll);

router.route('/relationships/doctor/:id')
    .get(Relationship.GetByDoctorId)
    .delete(Relationship.DeleteByDoctorId);
router.route('/relationships/count/doctor/:id')
    .get(Relationship.GetCountByDoctorId)

router.route('/relationships/user/:id')
    .get(Relationship.GetByUserId)
    .delete(Relationship.DeleteByUserId);

router.route('/relationships/group/:group')
    .get(Relationship.GetByGroupId);

router.route('/relationship/:id')
    .get(Relationship.GetById)
    .patch(urlencodedParser, Relationship.UpdateById)
    .delete(Relationship.DeleteById); // used in web side
router.route('/relationship/:did/:uid')
    .get(Relationship.CheckIfRelationshipExisted);

router.route('/relationship')
    .post(urlencodedParser, Relationship.FindOrAdd);

// paths to reverse
router.route('/relationships/doctor/:id/select')  // 返回用户组和用户信息: [group name, group id,] user name, user id
    .get(Relationship.GetSelectionByDoctorId);
router.route('/relationships/doctor/:id/userdetails')  // 用于药师用户管理, 返回用户信息: [name, cell id,] user name, user id
    .get(Relationship.GetUserDetailsByDoctorId);

router.route('/relationships/get-doctors/user/:id')  // 用于微信端用户获取已关注的药师
    .get(Relationship.GetFocusDoctorsByUser);
router.route('/relationships/get-schedule-doctors/user/:id')  // 用于微信端用户获取已关注的有门诊的药师
    .get(Relationship.GetScheduleDoctorsByUser);
router.route('/relationship/remove/:did/:uid')
    .delete(Relationship.RemoveRelationship);

//---------------- 医院+
const Hospital = require('../db/controller/hospital');

router.route('/hospitals')
    .get(Hospital.GetAll);
router.route('/hospitals/app/login')
    .get(Hospital.GetAppHospitals);
router.route('/hospitals/web/login')
    .get(Hospital.GetWebHospitals);

router.route('/hospital/customer-service')
    .get(Hospital.GetCustomerService);
router.route('/hospital/customer-service/:id')
    .patch(urlencodedParser, Hospital.UpdateCustomerService);

router.route('/hospital')
    .post(urlencodedParser, Hospital.Add);

router.route('/hospital/:id')
    .get(Hospital.GetById)
    .delete(Hospital.DeleteById)
    .patch(urlencodedParser, Hospital.UpdateById);

router.route('/hospital/hid/:hid')
    .get(Hospital.GetByHid)

router.route('/hospital/wechat/auth/:hid')
    .get(Hospital.getWechatSecretByHid)


//---------------- 医院科室
const Department = require('../db/controller/department');

router.route('/departments')
    .get(Department.GetAll);
router.route('/departments/cms')
    .get(Department.GetCmsAll);

router.route('/department')
    .post(urlencodedParser, Department.Add);

router.route('/department/:id')
    .get(Department.GetById)
    .delete(Department.DeleteById)
    .patch(urlencodedParser, Department.UpdateById);


//---------------- 疾病类别
const Disease = require('../db/controller/disease');

router.route('/diseases')
    .get(Disease.GetAll);

router.route('/diseases/:did') // 获得科室下的疾病类别
    .get(Disease.GetByDepartmentId);

router.route('/disease')
    .post(urlencodedParser, Disease.Add);

router.route('/disease/:id')
    .get(Disease.GetById)
    .delete(Disease.DeleteById)
    .patch(urlencodedParser, Disease.UpdateById);

//todo: remove
//---------------- 聊天室
var Chatroom = require('../db/controller/chatroom');

router.route('/chatrooms')
    .get(Chatroom.GetAll);

router.route('/chatrooms/doctor/:id')
    .get(Chatroom.GetByDoctorId);
router.route('/chatrooms/user/:id')
    .get(Chatroom.GetByUserId);

router.route('/chatroom/find/:doctorId/:userId')
    .get(Chatroom.GetByDoctorIdUserId);

router.route('/chatroom')
    .post(urlencodedParser, Chatroom.FindOrAdd);

router.route('/chatroom/:id')
    .get(Chatroom.GetById)
    .patch(urlencodedParser, Chatroom.UpdateById)
    .delete(Chatroom.DeleteById);


router.route('/chatrooms/check/doctor/:id')
    .get(Chatroom.CheckDoctorMsg);
router.route('/chatrooms/check/user/:id')
    .get(Chatroom.CheckUserMsg);
//router.route('/chatroom/:userid/:doctorid')
//    .get(Chatroom.GetByUseIdAndDoctorId);


//---------------- 聊天 chat
const Chat = require('../db/controller/chat');

// router.route('/chats')
//     .get(Chat.GetAll);
router.route('/chats/search')
    .post(Chat.search);

router.route('/chats/:room')
    .get(Chat.GetAllByRoom);

router.route('/chats/history/:sender/:to')
    .get(Chat.getChatHistoryBySenderAndTo);

router.route('/cs-chats/history/user/:uid') // 病患客服历史消息
    .get(Chat.getCsHistoryByUser);
router.route('/cs-chats/patient-list') // 客服病患列表
    .get(Chat.getCsPatientList);

// unread list
router.route('/chats/unread/doctor/:did')   // web-side
    .get(Chat.getUnreadByDoctor);
router.route('/chats/unread/user/:uid')     // wechat
    .get(Chat.getUnreadByPatient);
router.route('/cs-chats/unread/doctor/:did')// web-side
    .get(Chat.getCsUnreadByDoctor);

router.route('/chats/read/doctor/:did/:uid') // web-side: clear unread count
    .get(Chat.setReadByDoctorAndPatient);
router.route('/chats/read/user/:uid/:did')  // wechat: clear unread count
    .get(Chat.setReadByPatientAndDoctor);
router.route('/cs-chats/read/doctor/:did/:uid') // web-side
    .get(Chat.setCsReadByDoctorAndPatient);

router.route('/chat/:id')
    .get(Chat.GetById)
    // .patch(urlencodedParser, Chat.UpdateById)
    .delete(Chat.DeleteById);

// router.route('/chats/chatroom/:chatroom')
//     .delete(Chat.DeleteByChatroom);

// router.route('/chat')
//     .post(urlencodedParser, Chat.Add);

router.route('/chat/send')
    .post(urlencodedParser, Chat.SendMsg);

// router.route('/chats/receive')
//     .post(urlencodedParser, Chat.ReceiveMsg);

// router.route('/chats/load/doctor/:chatroom')
//     .get(Chat.LoadDoctorMsg);
// router.route('/chats/load/user/:chatroom')
//     .get(Chat.LoadUserMsg);
// router.route('/chats/load/:chatroom')
//     .get(Chat.LoadMsg);

//---------------- Notification
// const Notification = require('../db/controller/notification');

// router.route('/notis/doctor/:did')
//     .get(Notification.getNotisByDoctor);
// router.route('/notis/user/:uid')
//     .get(Notification.getNotisByUser);

// router.route('/noti/update')
//     .patch(urlencodedParser, Notification.UpdateNoti);
// router.route('/noti/clear')
//     .patch(urlencodedParser, Notification.ClearNoti);

//---------------- 门诊
const Schedule = require('../db/controller/schedule');

router.route('/schedules')
    .get(Schedule.GetAll);
router.route('/schedules/cms/populated')
    .get(Schedule.GetAllPopulated);

// router.route('/schedules/find/forward-available/:date')// 当日起往后3天的所有有效门诊
router.route('/schedules/find/forward-available')// 无限制
    .get(Schedule.FindForwardAvailable);
router.route('/schedules/find/doctors/:departmentid/:date/:period')
    .get(Schedule.FindScheduleDoctorsByDepartmentIdAndDate);    // 相同时间段内可选的同科室药师

router.route('/schedules/:did')
    .get(Schedule.GetByDoctorId);
router.route('/schedules/all/:did') // for test
    .get(Schedule.GetAllByDoctorId);
router.route('/schedules/:did/:date')
    .get(Schedule.GetByDoctorIdAndDate);

router.route('/schedule')
    .post(urlencodedParser, Schedule.Add);

router.route('/schedule/:id')
    .get(Schedule.GetById)
    .patch(urlencodedParser, Schedule.UpdateById)
    .delete(Schedule.DeleteById);

router.route('/schedules/reserve-space/:doctorid/:date/:period')
    .get(Schedule.ReserveScheduleSpace);
router.route('/schedule/find/:did/:period/:date')
    .get(Schedule.GetByDoctorPeriodDate);

router.route('/schedules/find-a-week/:did/:date')
    .get(Schedule.GetOneWeekByDoctorDate);

// 批量创建和删除Schedule
router.route('/schedules-bat-add')
    .post(urlencodedParser, Schedule.BatAdd);
router.route('/schedules-bat-delete')
    .post(urlencodedParser, Schedule.BatDelete);



//---------------- 门诊时间端
const Period = require('../db/controller/period');

router.route('/periods')
    .get(Period.GetAll);

router.route('/period/:id')
    .get(Period.GetById)
    .patch(urlencodedParser, Period.UpdateById)
    .delete(Period.DeleteById);

router.route('/period')
    .post(urlencodedParser, Period.Add);

//---------------- 预约
const Booking = require('../db/controller/booking');

router.route('/bookings')
    .get(Booking.GetAll);
router.route('/bookings/cms/populated')
    .get(Booking.GetAllPopulated);
router.route('/bookings/search')
    .post(Booking.search);

router.route('/bookings/user/:uid')
    .get(Booking.GetByUserId);

router.route('/bookings/doctor/:did')
    .get(Booking.GetByDoctorId);
router.route('/bookings/doctor/:did/:from')
    .get(Booking.GetByDoctorIdAndFrom);
router.route('/bookings/cancelled/doctor/:did')
    .get(Booking.GetCancelledBookingsByDoctorId); // 获取没有过期的未读的病患取消预约
router.route('/bookings/read-cancelled/doctor/:did/:uid') // web-side: clear unread count
    .get(Booking.setCancelReadByPatientDoctor);

router.route('/bookings/today/doctor/:did')
    .get(Booking.GetTodaysByDoctorId);
router.route('/bookings/counts/doctor/:did') // used in dashboard
    .get(Booking.GetCountsByDoctorId);

router.route('/bookings/schedule/:sid')
    .get(Booking.GetByScheduleId);
router.route('/bookings/my/user/:uid')
    .get(Booking.getPopulatedBookingsByUser);

router.route('/booking')
    .post(urlencodedParser, Booking.Add);

router.route('/booking/:id')
    .get(Booking.GetById)
    .patch(urlencodedParser, Booking.UpdateById)
    .delete(Booking.DeleteById);

//---------------- 系统全局变量
const Const = require('../db/controller/const');

router.route('/consts')
    .get(Const.GetAll);

router.route('/const')
    .post(urlencodedParser, Const.Add);

router.route('/const/:id')
    .delete(Const.DeleteById)
    .patch(urlencodedParser, Const.UpdateById);

router.route('/const/:name')
    .get(Const.GetByName);
router.route('/consts/group/:group')
    .get(Const.getByGroup);


//===================================== Version 1.0

//---------------- 问卷调查类别/section
// var SurveyCat = require('../db/controller/surveyCat');

// router.route('/surveycats')
//     .get(SurveyCat.GetAll);
// router.route('/surveycats/department/:did')
//     .get(SurveyCat.GetSurveyCatsByDepartmentId);

// router.route('/surveycat')
//     .post(urlencodedParser, SurveyCat.Add);

// router.route('/surveycat/:id')
//     .get(SurveyCat.GetById)
//     .delete(SurveyCat.DeleteById)
//     .patch(urlencodedParser, SurveyCat.UpdateById);



//---------------- 问卷模版,包含问题
const SurveyTemplate = require('../db/controller/surveyTemplate');

router.route('/surveytemplates')
    .get(SurveyTemplate.GetAll);

router.route('/surveytemplates/:department/type/:type')
    .get(SurveyTemplate.GetSurveyTemplatesByType);
router.route('/surveytemplates/:department/type/:type/:list')
    .get(SurveyTemplate.GetSurveyTemplatesByTypeAndList);
router.route('/surveytemplates/department/:did')
    .get(SurveyTemplate.GetSurveyTemplatesByDepartmentId);

router.route('/surveytemplate')
    .post(urlencodedParser, SurveyTemplate.Add);

router.route('/surveytemplate/:id')
    .get(SurveyTemplate.GetById)
    .delete(SurveyTemplate.DeleteById)
    .patch(urlencodedParser, SurveyTemplate.UpdateById);

//---------------- 问卷调查,包含问题
const Survey = require('../db/controller/survey');

router.route('/surveys')
    .get(Survey.GetAll);
router.route('/surveys/search')
    .post(Survey.search);
router.route('/surveys/content-search')
    .post(Survey.contentSearch);


router.route('/surveys/:doctor/:user/:type/:readonly')
    .get(Survey.GetSurveysByUserType);
router.route('/surveys/all/:doctor/:user/:type/:list')
    .get(Survey.GetAllSurveysByUserTypeAndList);
router.route('/surveys/:doctor/:user/:type/:list/:readonly')
    .get(Survey.GetSurveysByUserTypeAndList);

router.route('/mysurveys/:user')
    .get(Survey.GetMySurveys);
router.route('/mysurveys/:user/:doctor/:type/:date')
    .get(Survey.GetMySurveysStart);
router.route('/surveys/department/:did')
    .get(Survey.GetSurveysByDepartmentId);

router.route('/survey')
    .post(urlencodedParser, Survey.Add);

router.route('/survey/:id')
    .get(Survey.GetById)
    .delete(Survey.DeleteById)
    .patch(urlencodedParser, Survey.UpdateById);

router.route('/surveys/close/:doctor/:user') // set finished=true for type in [1,2,5]
    .patch(urlencodedParser, Survey.CloseAllRelativeSurveys);

//---------------- 线下咨询模板
const AdviseTemplate = require('../db/controller/adviseTemplate');

router.route('/advisetemplates')
    .get(AdviseTemplate.GetAll);

router.route('/advisetemplates/department/:did') // 线下咨询模板
    .get(AdviseTemplate.GetAdviseTemplatesByDepartmentId);
router.route('/advisetemplates/cms/department/:did') // 线下咨询模板 for cms
    .get(AdviseTemplate.GetCmsAdviseTemplatesByDepartmentId);

router.route('/advisetemplate')
    .post(urlencodedParser, AdviseTemplate.Add);

router.route('/advisetemplate/:id')
    .get(AdviseTemplate.GetById)
    .delete(AdviseTemplate.DeleteById)
    .patch(urlencodedParser, AdviseTemplate.UpdateById);

//---------------- 线下咨询
const Advise = require('../db/controller/advise');

router.route('/advises')
    .get(Advise.GetAll);

router.route('/advises/doctor-view-user-history/:user/:doctor') // used by 药师端
    .get(Advise.GetUserAdviseHistory);

router.route('/advises/user-history/:user') // used by 病患微信端
    .get(Advise.GetAdviseHistoryByUser);

router.route('/advises/doctor-pending/:doctor')
    .get(Advise.GetDoctorPendingAdvises);

router.route('/advises/search')
    .post(Advise.search);

router.route('/advise')
    .post(urlencodedParser, Advise.Add);

router.route('/advise/:id')
    .get(Advise.GetById)
    .delete(Advise.DeleteById)
    .patch(urlencodedParser, Advise.UpdateById);

// //---------------- 线下咨询 comment
// const AdviseComment = require('../db/controller/adviseComment');

// router.route('/advise-comment/:doctor')
//     .get(AdviseComment.GetAllByDoctorId);
// router.route('/advise-comment/advise/:aid') // get by advise id
//     .get(AdviseComment.GetById);
// router.route('/advise-comment/:doctor/:from/:size')
//     .get(AdviseComment.GetByDoctorIdAndFromSize);

// router.route('/advise-comment')
//     .post(urlencodedParser, AdviseComment.Add)
// router.route('/advise-comment/:id')
//     .delete(AdviseComment.DeleteById);
    
//---------------- 问卷调查集合
// var SurveyGroup = require('../db/controller/surveyGroup');

// router.route('/surveygroups')
//     .get(SurveyGroup.GetAll);

// router.route('/surveygroups/:department/type/:type')
//     .get(SurveyGroup.GetSurveyGroupsByType);

// router.route('/surveygroup')
//     .post(urlencodedParser, SurveyGroup.Add);

// router.route('/surveygroup/:id')
//     .get(SurveyGroup.GetById)
//     .delete(SurveyGroup.DeleteById)
//     .patch(urlencodedParser, SurveyGroup.UpdateById);

//---------------- 药品管理
const Medicine = require('../db/controller/medicine');

router.route('/medicines')
    .get(Medicine.GetAll);

router.route('/medicines/available')
    .get(Medicine.GetAllAvailable);

// router.route('/medicines/cat/:catid')
//     .get(Medicine.GetMedicinesByCatId);

router.route('/medicine')
    .post(urlencodedParser, Medicine.Add);

router.route('/medicine/:id')
    .get(Medicine.GetById)
    .delete(Medicine.DeleteById)
    .patch(urlencodedParser, Medicine.UpdateById);

//---------------- 处方管理
var Prescription = require('../db/controller/prescription');

router.route('/prescriptions')
    .get(Prescription.GetAll);

router.route('/prescriptions/booking/:id')
    .get(Prescription.GetByBookingId);
router.route('/prescriptions/doctor/:id')
    .get(Prescription.GetByDoctorId);
router.route('/prescriptions/user/:id')
    .get(Prescription.GetByUserId);

router.route('/prescription')
    .post(urlencodedParser, Prescription.Add);

router.route('/prescription/:id')
    .get(Prescription.GetById)
    .delete(Prescription.DeleteById)
    .patch(urlencodedParser, Prescription.UpdateById);

//---------------- 宣教材料类别
var ArticleCat = require('../db/controller/articleCat');

router.route('/articlecats')
    .get(ArticleCat.GetAll);
router.route('/articlecats/department/:did')
    .get(ArticleCat.GetArticleCatsByDepartmentId);

router.route('/articlecat')
    .post(urlencodedParser, ArticleCat.Add);

router.route('/articlecat/:id')
    .get(ArticleCat.GetById)
    .delete(ArticleCat.DeleteById)
    .patch(urlencodedParser, ArticleCat.UpdateById);


//---------------- 宣教材料模板
var ArticleTemplate = require('../db/controller/articleTemplate');

router.route('/templates')
    .get(ArticleTemplate.GetAll);

router.route('/templates/cat/:catid')
    .get(ArticleTemplate.GetArticleTemplatesByCatId);
router.route('/templates/department/:did')
    .get(ArticleTemplate.GetArticleTemplatesByDepartmentId);

router.route('/template')
    .post(urlencodedParser, ArticleTemplate.Add);

router.route('/template/:id')
    .get(ArticleTemplate.GetById)
    .delete(ArticleTemplate.DeleteById)
    .patch(urlencodedParser, ArticleTemplate.UpdateById);

//---------------- 宣教材料文章页面
var ArticlePage = require('../db/controller/articlePage');

router.route('/pages')
    .get(ArticlePage.GetAll);
router.route('/pages/search')
    .post(ArticlePage.search);

router.route('/pages/cat/:catid')
    .get(ArticlePage.GetArticlePagesByCatId);
router.route('/pages/doctor/:did')
    .get(ArticlePage.GetArticlePagesByDoctorId);
router.route('/pages/doctor/:did/:catid')
    .get(ArticlePage.GetArticlePagesByDoctorIdAndCatId);

router.route('/page')
    .post(urlencodedParser, ArticlePage.Add);

router.route('/page/:id')
    .get(ArticlePage.GetById)
    .delete(ArticlePage.DeleteById)
    .patch(urlencodedParser, ArticlePage.UpdateById);

router.route('/auth/page/:id')
    .get(ArticlePage.GetById);


//---------------- 微信失败的发送消息 LOG
//todo: replace with wsMsgQueue
var MessageLog = require('../db/controller/messageLog');

router.route('/messagelogs')
    .get(MessageLog.GetAll);

router.route('/messagelogs/doctor/:did')
    .get(MessageLog.GetMessageLogsByDoctor);
router.route('/messagelogs/user/:uid')     // 只返回用户没有收到的
    .get(MessageLog.GetMessageLogsByUser);

router.route('/messagelog')
    .post(urlencodedParser, MessageLog.Add);

router.route('/messagelog/:id')
    .get(MessageLog.GetById)
    .delete(MessageLog.DeleteById)
    .patch(urlencodedParser, MessageLog.UpdateById);


//---------------- 不良反应(基于科室)
const AdverseReaction = require('../db/controller/adverseReaction');

router.route('/adversereactions')
    .get(AdverseReaction.GetAll);
router.route('/adversereactions/department/:did')
    .get(AdverseReaction.GetByDepartmentId);

router.route('/adversereaction')
    .post(urlencodedParser, AdverseReaction.Add);

router.route('/adversereaction/:id')
    .get(AdverseReaction.GetById)
    .delete(AdverseReaction.DeleteById)
    .patch(urlencodedParser, AdverseReaction.UpdateById);

//---------------- 用户反馈
var UserFeedback = require('../db/controller/userFeedback');

router.route('/feedbacks')
    .get(UserFeedback.GetAll);
router.route('/feedbacks/search')
    .post(UserFeedback.search);

router.route('/feedbacks/user/:type/:uid')
    .get(UserFeedback.GetByUserId);

router.route('/feedbacks/user/:type/:uid/:did')
    .get(UserFeedback.GetByUserIdDoctorId);

router.route('/feedbacks/doctor/:type/:did')
    .get(UserFeedback.GetByDoctorId);
router.route('/feedbacks/unread/doctor/:did')
    .get(UserFeedback.GetUnreadByDoctorId);
router.route('/feedback/unreadcount/:type/:did')
    .get(UserFeedback.GetUnreadCountByDoctorId);

router.route('/feedbacks/unread/:type/:did/:uid')
    .get(UserFeedback.GetUnreadByDoctorIdUserId);

router.route('/feedbacks/read/doctor/:type/:did/:uid') // web-side: clear unread count
    .get(UserFeedback.setReadByDoctorPatientAndType);
router.route('/feedbacks/read/user/:type/:uid/:did')  // wechat: clear unread count
    .get(UserFeedback.setReadByPatientDoctorAndType);

router.route('/feedback')
    .post(urlencodedParser, UserFeedback.Add);

router.route('/feedback/:id')
    .get(UserFeedback.GetById)
    .patch(urlencodedParser, UserFeedback.UpdateById);

//---------------- 药师坐诊
const Diagnose = require('../db/controller/diagnose');

router.route('/diagnose/search')
    .post(Diagnose.search);
router.route('/diagnose/medicine-usage/search')
    .post(Diagnose.searchMedicineUsage);
router.route('/diagnose/test-usage/search')
    .post(Diagnose.searchTestUsage);

router.route('/diagnose/:doctor/:user')
    .get(Diagnose.GetByUserAndDoctor);

router.route('/diagnoses/currentmonth/:doctor') // to remove
    .get(Diagnose.GetCurrentMonthFinishedByDoctor);
router.route('/diagnoses/counts/:doctor')
    .get(Diagnose.GetCountsByDoctor);

router.route('/diagnoses/history/:user')
    .get(Diagnose.GetUserHistoryList);
router.route('/diagnose/history/latest/:user')
    .get(Diagnose.GetUserLatestDiagnose);


router.route('/diagnose')
    .post(urlencodedParser, Diagnose.Add);

router.route('/diagnose/:id')
    .get(Diagnose.GetById)
    .delete(Diagnose.DeleteById)
    .patch(urlencodedParser, Diagnose.UpdateById);

// 药师评估
router.route('/diagnose-assessment/:id')
    .get(Diagnose.GetAssessmentById)
    .patch(urlencodedParser, Diagnose.UpdateAssessmentById);

// 药师评估统计
router.route('/diagnose-assessments/:did')
    .get(Diagnose.GetAssessmentsByDoctor);
router.route('/diagnose-counts/:did')
    .get(Diagnose.GetDiagnoseCountsByDoctor);

//---------------- 文章关键字搜索
const ArticleSearch = require('../db/controller/articleSearch');

router.route('/keywordsearchs')
    .get(ArticleSearch.GetAll);

router.route('/keywordsearch')
    .post(urlencodedParser, ArticleSearch.Add);

router.route('/keywordsearch/:id')
    .get(ArticleSearch.GetById)
    .delete(ArticleSearch.DeleteById)
    .patch(urlencodedParser, ArticleSearch.UpdateById);

router.route('/auth/keywordsearchs/:hid/:keyword')
    .get(ArticleSearch.GetSerachResults);

//---------------- 实验室化验结果 //todo: to remove
var LabResult = require('../db/controller/labResult');

router.route('/labresults')
    .get(LabResult.GetAll);
router.route('/labresult/user/:uid')
    .get(LabResult.GetLabResultsByUserId);

router.route('/labresult')
    .post(urlencodedParser, LabResult.Add);

router.route('/labresult/:id')
    .get(LabResult.GetById)
    .delete(LabResult.DeleteById)
    .patch(urlencodedParser, LabResult.UpdateById);

//---------------- 化验单模板
const TestForm = require('../db/controller/testForm');

router.route('/testforms/cms-all')
    .get(TestForm.GetCmsAll);
router.route('/testforms')
    .get(TestForm.GetAll);
router.route('/testforms/type/:type')
    .get(TestForm.GetTestFormTemplatesByType);

router.route('/testform')
    .post(urlencodedParser, TestForm.Add);

router.route('/testform/:id')
    .get(TestForm.GetById)
    .delete(TestForm.DeleteById)
    .patch(urlencodedParser, TestForm.UpdateById);

//---------------- 化验单
const Test = require('../db/controller/test');

router.route('/tests/:list')
    .get(Test.GetByList);
router.route('/tests/user/:user')
    .get(Test.GetByUserId);

router.route('/test')
    .post(urlencodedParser, Test.Add);

router.route('/test/:id')
    .get(Test.GetById)
    .delete(Test.DeleteById)
    .patch(urlencodedParser, Test.UpdateById);

//---------------- FAQ
const Faq = require('../db/controller/faq');

router.route('/faqs/wechat/auth/:hid') // used by wechat
    .get(Faq.GetAll);
router.route('/faqs/edit')
    .get(Faq.GetEditAll);
router.route('/faq')
    .post(urlencodedParser, Faq.Add);
router.route('/faq/:id')
    .delete(Faq.DeleteById)
    .patch(urlencodedParser, Faq.UpdateById);


//---------------- surveyStatusLogs
var SurveyStatusLog = require('../db/controller/surveyStatusLog');

router.route('/surveyStatusLogs')
    .get(SurveyStatusLog.GetAll);
router.route('/surveyStatusLog')
    .post(urlencodedParser, SurveyStatusLog.Add);
router.route('/surveyStatusLog/:key')
    .get(SurveyStatusLog.GetByKey);

//===================== 图片上传
const Uploader = require('../upload/upload');

// router.route('/upload/:dir')
// router.route('/upload')
//     .post(urlencodedParser, Uploader.receiveFile);

router.route('/upload/doctor/:prefix')
    .post(bigFileUrlencodedParser, Uploader.uploadDoctorFile);

router.route('/upload/medicine/:prefix')
    .post(bigFileUrlencodedParser, Uploader.uploadMedicineFile);

router.route('/upload/user/:prefix')
    .post(bigFileUrlencodedParser, Uploader.uploadUserFile);

router.route('/upload/template/:prefix')
    .post(bigFileUrlencodedParser, Uploader.uploadTemplateFile);

router.route('/upload/init-folders')
    .post(urlencodedParser, Uploader.initFolders);

router.route('/upload/remove')
    .post(urlencodedParser, Uploader.removeFile);

router.route('/upload/list/:dir')
    .get(Uploader.getFolderImageList);


///////////////////////////////////////////////////////////////////////////////////
//
//  数据库管理
//
///////////////////////////////////////////////////////////////////////////////////
const Admin = require('../db/controller/admin');

router.route('/admin/userdata/:id')
    .delete(Admin.DeleteUserAndRelatedData);

///////////////////////////////////////////////////////////////////////////////////
//  微信公众号
const wechat = require('../wechat/auth.service');
const SignatureStore = require('../wechat/signature.controller'); // could remove?

router.route('/wechat/auth')
    .get(wechat.authTest) // used in changing wechat settingd
    .post(wechat.receiveAuth);
router.route('/wechat/authSignature/:openid')
    .get(SignatureStore.GetByOpenId);

router.route('/wechat/authWeixinToken')
    .get(wechat.getWeixinToken);
router.route('/wechat/authRefreshWeixinToken')
    .get(wechat.refreshWeixinToken);


router.route('/wechat/get-doctor-qrcode/:did')
    .get(wechat.getDoctorQrcode);
router.route('/wechat/send-wechat-template-msg')
    .post(urlencodedParser, wechat.sendWechatTemplateMessage);
router.route('/wechat/send-client-msg/:openid') // 系统/客服消息
    .post(urlencodedParser, wechat.sendClientMessage);

router.route('/wechat/login/:hid/:openid') // get apiToken and wechat secret
    .get(wechat.generateApiToken);

router.route('/wechat/resend-msg/:openid') // 尝试重新发送
    .get(wechat.resendFailedMsg);

router.route('/wechat/material-count/auth/:hid') // 获取永久素材总数
    .get(wechat.getWxMaterialCount);
router.route('/wechat/material-list/auth/:hid/:page') // 获取永久素材的列表, :page is page index (20/page)
    .get(wechat.getWxMaterialList);

// 微信支付 （JSAPI）
const WxPayment = require('../wechat/payment');
router.route('/wechat/pay-notify') // 回调通知
    .post([express.text({ type: '*/xml' })], WxPayment.notify);
router.route('/wechat/pay-unified-order') // 统一下单
    .post(urlencodedParser, WxPayment.unifiedOrder);
router.route('/wechat/pay-refund') // 申请退款 ?
    .post(urlencodedParser, WxPayment.refund);
router.route('/wechat/pay-order-query') // 查询订单
    .post(urlencodedParser, WxPayment.orderQuery);
router.route('/wechat/pay-reverse') // 撤消订单
    .post(urlencodedParser, WxPayment.reverse);
router.route('/wechat/pay-close-order') // 查询关闭订单
    .post(urlencodedParser, WxPayment.closeOrder);
router.route('/wechat/pay-download-bill') // 下载对帐单
    .post(urlencodedParser, WxPayment.downloadBill);

// 账单
const Order = require('../db/controller/order');
router.route('/orders')
    .get(Order.GetAll);
router.route('/order')
    .post(urlencodedParser, Order.Update);
router.route('/order/:id')
    .get(Order.GetById)
    .delete(Order.DeleteById);

// jsapi config (signature)
const Jsapi = require('../wechat/jsapi-config');
router.route('/wechat/jsapi')
    .get(Jsapi.getJsapiConfig);

// 微信失败消息
const WxMsgQueue = require('../db/controller/wxMsgQueue');
router.route('/wechat/msg-queue/all')
    .get(WxMsgQueue.GetAll);
router.route('/wechat/msg-queue/doctor/:did')
    .get(WxMsgQueue.GetByDoctorId);
router.route('/wechat/msg-queue/:id')
    .delete(WxMsgQueue.DeleteById);
router.route('/wechat/msg-queue/openid/:openid')
    .delete(WxMsgQueue.DeleteByOpenid);



//=============== Seeding ===================
router.route('/seeding/auth/consts/:hid')
    .post(urlencodedParser, Const.seeding);
router.route('/seeding/auth/hospital/:hid')
    .post(urlencodedParser, Hospital.seeding);

module.exports = router;
