/**
 * Created by hhu on 2016/5/7.
 */

module.exports = {
    SUCCESS: "success",
    FAILED: "failed",
    ERROR: "error",
    NOT_EXISTED: 'not_existed',
    EXISTED: 'existed',
    EXISTED_NAME: 'existed_name',
    NULL: 'null', // 记录没有找到

    // parameter validation
    NO_CELL: 'no_cell',
    NO_NAME: 'no_name',
    NO_ID: 'no_id',
    NO_HID: 'no_hid',
    NO_PASSWORD: 'no_password',
    NO_USER: 'no_user',
    NO_DEPARTMENT: 'no_department',
    NO_DOCTOR: 'no_doctor',
    NO_ROLE: 'no role',
    NO_TYPE: 'no type',
    NO_CAT: 'no category',
    NO_GROUP: 'no group',
    NO_VALUE: 'no value',
    MISSING_PARAM: 'missing_param',
    INVALID_PARAM: 'invalid_param',
    NOT_REGISTERED: 'not_registered',
    WRONG_PASSWORD: 'wrong_password',
    PASS: 'PASS',
    DOUBLE_BOOKING: 'double_booking',
    NO_BOOKING_AVAILABLE: 'no_booking_available',
    NO_ORDERID: 'no_order_id',

    CHATROOM_ERROR: 'chatroom_error',
    NO_MESSAGE: 'no_message',
    TOKEN_EXPIRED: 'token_expired',
    TOKEN_INVALID: 'token_invalid',
    DELETE_NOT_ALLOWED: 'deleteNotAllowed',

    OPERATION_FAILED: 'operation_failed',


    returnStatus: function (res, status, err) {
        // let ret = _.extend({ return: status }, err);
        let ret = { ...err, return: status };
        res.status(500).send(ret);
    },

}