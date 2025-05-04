// --- START OF FILE config/socket.js ---

// This function receives the Socket.IO server instance (io)
module.exports = function(io) {

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // --- User Room Joining ---
        // Client should emit 'joinUserRoom' with their userId after connecting
        socket.on('joinUserRoom', (userId) => {
            if (userId) {
                const roomName = userId.toString(); // Ensure room name is a string
                console.log(`Socket ${socket.id} attempting to join room: ${roomName}`);
                socket.join(roomName);
                // You could emit a confirmation back if needed:
                // socket.emit('joinedRoom', roomName);
            } else {
                console.warn(`Socket ${socket.id} tried to join room with invalid userId.`);
            }
        });


        // --- Listening for Client-Side Events (Examples) ---
        // Replace these with actual events your client might send
        socket.on('sendMessage', (data) => {
            console.log(`Message received from ${socket.id}:`, data);
            // Example: Broadcast message to a specific room (e.g., a project chat)
            // if (data.projectId) {
            //   io.to(data.projectId.toString()).emit('newMessage', { user: 'Someone', text: data.message });
            // }
        });


        // --- Handling Task Notifications (Triggered by Server Routes) ---
        // IMPORTANT: The 'taskUpdated' and 'taskAssigned' events should typically be
        // EMITTED FROM YOUR SERVER ROUTES (e.g., tasks.js) using the `io` instance,
        // not listened for *from* the client here. The client listens for 'taskNotification'.

        // Example of how to structure the notification emission in your route:
        /*
        // --- Inside routes/tasks.js (e.g., after task update) ---
        const io = req.app.get('socketio'); // Assumes io is attached to app in app.js
        if (io && updatedTask && updatedTask.assignedTo) {
            updatedTask.assignedTo.forEach(assignee => {
                if (assignee.user) { // Ensure user field exists
                     const targetUserId = assignee.user.toString();
                     console.log(`Emitting taskNotification (update) to user: ${targetUserId}`);
                     io.to(targetUserId).emit('taskNotification', {
                         type: 'update',
                         taskId: updatedTask._id,
                         message: `Task "${updatedTask.title}" was updated.`
                     });
                }
            });
        }
        */

        // --- Handling Disconnect ---
        socket.on('disconnect', (reason) => {
            console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
            // You might want to perform cleanup here, e.g., remove user from active list
        });

        // --- Handling Socket Errors ---
        socket.on('error', (error) => {
             console.error(`Socket Error on ${socket.id}:`, error);
        });

    }); // End io.on('connection')

    console.log('Socket.IO event handlers configured.');

    // Optional: Add io instance to the app object so routes can access it
    // In app.js: app.set('socketio', io);
    // Then in routes: const io = req.app.get('socketio');

}; // End module.exports


// --- START OF FILE config/socket.js ---
module.exports = function(io) {

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // --- User Room Joining ---
        // Client should emit 'joinUserRoom' with their userId after connecting
        socket.on('joinUserRoom', (userId) => {
            if (userId) {
                const roomName = userId.toString(); // Ensure room name is a string
                //console.log(`Socket ${socket.id} joining room: ${roomName}`);
                socket.join(roomName); // Add socket to the user-specific room
                // Optional: Send confirmation back to client
                // socket.emit('roomJoined', { room: roomName });
            } else {
                console.warn(`Socket ${socket.id} tried to join room with invalid userId.`);
            }
        });

        // --- Other socket event listeners (disconnect, etc.) ---
        socket.on('disconnect', (reason) => {
            //console.log(`Socket disconnected: ${socket.id}. Reason: ${reason}`);
        });
        socket.on('error', (error) => {
             console.error(`Socket Error on ${socket.id}:`, error);
        });

    }); // End io.on('connection')

    //console.log('Socket.IO event handlers configured.');
};
// --- END OF FILE config/socket.js ---


// --- END OF FILE config/socket.js ---