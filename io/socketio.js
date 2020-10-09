const moment = require('moment');

module.exports = (io) => {
    io.on('connection', socket => {
        console.log(`--------> connected to socket: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log('<---------x user disconnected');
        });

        socket.on('chat', (room, chat) => {
            // if (socket.rooms.indexOf(room) == -1) {
            //     socket.join(room);
            //     console.log('joined to room ' + room);

            // }
            //todo: save to db
            socket.to(room).emit('chat', chat);

            socket.to(room).emit('notification', {
                patientId: chat.sender,
                type: 0,
                name: chat.senderName || '',
                count: 1,
                created: chat.created
            });

            // console.log('chat message: ', room, msg);
        });

        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log('joined to room ' + room);
        });

        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log('left room ' + room);
        });

        // Feedback

        socket.on('feedback', (room, feedback) => {
            // console.log('rooms: ', socket.rooms);

            socket.to(room).emit('feedback', feedback);

            socket.to(room).emit('notification', {
                patientId: feedback.user,
                type: feedback.type,
                name: feedback.senderName || '',
                count: 1,
                created: feedback.createdAt
            });
        });

        // Booking (cancel for now)

        socket.on('booking', (room, booking) => {
            console.log('---> on booking: ', room, booking);
            // redirect to noti
            socket.to(room).emit('notification', {
                patientId: booking.user._id,
                type: 3,
                name: `${booking.user.name} 取消了${moment(booking.date).format('LL')}预约`,
                count: 1,
                created: booking.created
            });
        });
    });
}
