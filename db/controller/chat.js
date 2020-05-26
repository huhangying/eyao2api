var Chat = require('../model/chat.js');

module.exports = {

    // for API access
    SendMsg: (req, res, next) => {
        const chat = req.body;
        if (!chat.sender || !chat.to || !chat.room) {
            return Status.returnStatus(res, Status.MISSING_PARAM);
        }

        Chat.create(chat)
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // new
    GetAllByRoomBySender: (req, res, next) => {
        const { sender } = req.params;
        Chat.find({ hid: req.token.hid })
            .or([{ sender: sender }, { to: sender }]) // either sender or
            .sort({ created: -1 })
            .limit(40)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    getChatHistoryBySenderAndTo: (req, res, next) => {
        const { sender, to } = req.params;
        Chat.find({ hid: req.token.hid })
            .or([{ sender: sender, to: to }, { sender: to, to: sender }]) // either sender or
            .sort({ created: -1 })
            .limit(40)
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    // for test
    GetAllByRoom: (req, res, next) => {
        const { room } = req.params;

        Chat.find({ hid: req.token.hid, room: room })
            .sort({ created: -1 })
            .select('-hid -__v')
            .lean()
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    //todo: reverse the last one

    //todo: read++


    GetById: (req, res, next) => {
        const { id } = req.params;
        Chat.findOne({ _id: id })
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

    DeleteById: (req, res, next) => {
        const { id } = req.params;
        Chat.findByIdAndDelete(id)
            .select('-hid -__v')
            .then((result) => res.json(result))
            .catch(err => next(err));
    },

}