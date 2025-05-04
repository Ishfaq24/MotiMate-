// --- START OF FILE config/socket.js ---
module.exports = function(io) {

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // If using session middleware with Socket.IO (requires io.use setup in app.js)
        // const session = socket.request.session;
        // if (session && session.passport && session.passport.user) {
        //     console.log(`User ${session.passport.user} connected via socket ${socket.id}`);
        //     // You can automatically join the user to their room here
        //     socket.join(session.passport.user); // Assuming user ID is stored directly
        // } else {
        //     console.log(`Anonymous socket connection: ${socket.id}`);
        // }

        // Manual room joining from client
        socket.on('joinUserRoom', (userId) => {
            if (userId) {
                console.log(`Socket ${socket.id} joining room for user ${userId}`);
                socket.join(userId.toString()); // Ensure userId is a string for room name
            } else {
                console.warn(`Socket ${socket.id} tried to join room with invalid userId.`);
            }
        });

        // Example: Listen for an event from the server-side (e.g., after a task is saved in a route)
        // This pattern requires you to emit events *from your routes* to Socket.IO
        // You'll need to pass `io` to your routes/controllers or use a shared event emitter.
        // Example: io.emit('some_event', data); // From another part of your app

        // Example: Listen for events from the client
        socket.on('clientEventExample', (data) => {
             console.log(`Received clientEventExample from ${socket.id}:`, data);
             // Broadcast to others, respond, etc.
             // socket.broadcast.emit('serverMessage', { message: 'Something happened!' });
        });


        // --- Specific Task Notifications ---
        // These events ('taskUpdated', 'taskAssigned') would typically be *emitted*
        // from your server-side route handlers after a task is successfully
        // updated or assigned, not listened for *from* the client here.
        // The client listens for 'taskNotification'.

        // Example of how a route might trigger this (needs io instance available):
        /*
        // In routes/tasks.js (after successful update/assignment)
        const io = req.app.get('socketio'); // Need to attach io to app: app.set('socketio', io);
        if (io) {
             // Notify assignees about update
             updatedTask.assignedTo.forEach(assignee => {
                  io.to(assignee.user.toString()).emit('taskNotification', {
                      type: 'update',
                      taskId: updatedTask._id,
                      message: `Task "${updatedTask.title}" updated.`
                  });
             });
             // Notify specific user about assignment
             io.to(newAssigneeId.toString()).emit('taskNotification', {
                  type: 'assignment',
                  taskId: newTask._id,
                  message: `You were assigned to "${newTask.title}".`
             });
        }
        */

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
        });

        socket.on('error', (error) => {
             console.error(`Socket Error on ${socket.id}:`, error);
        });
    });

    console.log('Socket.IO configuration loaded.');
};
// --- END OF FILE config/socket.js ---