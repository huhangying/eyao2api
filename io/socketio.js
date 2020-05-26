function onConnect(socket) {
    console.log(`--------> connected to socket: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log('xxxxxxxx user disconnected');
    });

    socket.on('chat', (room, msg) => {
        // if (socket.rooms.indexOf(room) == -1) {
        //     socket.join(room);
        //     console.log('joined to room ' + room);
            
        // }
        // save to db
        socket.to(room).emit(msg);

        console.log('chat message: ', room, msg);
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
}

module.exports = {
    onConnect
};