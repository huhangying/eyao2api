
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
               //todo: 
            })
            
            // console.log('chat message: ', room, msg);
        });

        socket.on('joinRoom', (room) => {
            socket.join(room);
            console.log('joined to room ' + room);
        })

        socket.on('leaveRoom', (room) => {
            socket.leave(room);
            console.log('left room ' + room);
        })

        // Feedback

        socket.on('feedback', (msg) => {
            console.log('feedback: ', msg);
        });

    });
}
