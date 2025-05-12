module.exports = function(io) {

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

       
        // Manual room joining from client
        socket.on('joinUserRoom', (userId) => {
            if (userId) {
                console.log(`Socket ${socket.id} joining room for user ${userId}`);
                socket.join(userId.toString()); // Ensure userId is a string for room name
            } else {
                console.warn(`Socket ${socket.id} tried to join room with invalid userId.`);
            }
        });

        
        // Example: Listen for events from the client
        socket.on('clientEventExample', (data) => {
             console.log(`Received clientEventExample from ${socket.id}:`, data);
             
        });

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
