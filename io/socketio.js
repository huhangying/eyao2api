const moment = require('moment');

module.exports = (io) => {
    io.on('connection', socket => {
        console.log(`--------> connected to socket: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`<---------x user disconnected on ${socket.id}`);
        });

        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log('joined to room ' + room);
        });

        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log('left room ' + room);
        });

        // Chat

        socket.on('chat', (room, chat) => {

            socket.to(room).emit('chat', chat);

            socket.to(room).emit('notification', {
                patientId: chat.sender,
                type: 0,
                name: chat.senderName || '',
                count: 1,
                created: chat.created
            });

        });

        // customer service chat

        socket.on('customerService', (room, chat) => {

            socket.to(room).emit('chat', chat); // 还是用原来chat的那一套来传递消息

            socket.to(room).emit('notification', {
                patientId: chat.sender,
                type: 4, // 客服chat
                name: chat.senderName || '',
                count: 1,
                created: chat.created
            });

        });

        // Feedback

        socket.on('feedback', (room, feedback) => {
            // console.log('rooms: ', socket.rooms);

            socket.to(room).emit('feedback', feedback);

            socket.to(room).emit('notification', {
                patientId: feedback.user,
                type: feedback.type, // 1 不良反应 or 2 联合用药
                name: feedback.senderName || '',
                count: 1,
                created: feedback.createdAt
            });
        });

        // Booking (cancel feature for now)

        socket.on('booking', (room, booking) => {
            // console.log('---> on booking: ', room, booking);
            // redirect to noti
            socket.to(room).emit('notification', {
                patientId: booking.user._id,
                type: 3, // 门诊预约
                name: `${booking.user.name} 取消了${moment(booking.date).format('LL')}预约`,
                count: 1,
                created: booking.created
            });
        });

        // Consult

        socket.on('consult', (room, consult) => {
            // console.log('---> on booking: ', room, booking);
            // redirect to noti
            socket.to(room).emit('notification', {
                patientId: consult.user,
                type: consult.type === 1 ? 6 : 5, // 付费咨询 (0: 图文；1：电话) => notiType (5: 图文；6：电话 )
                name: `${consult.userName} 发送了付费${consult.type === 1 ? '电话' : '图文'}咨询`,
                count: 1,
                created: consult.created
            });
        });
    });
}
