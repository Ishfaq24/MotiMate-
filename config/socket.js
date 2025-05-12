module.exports = function(io) {

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('joinUserRoom', (userId) => {
            if (userId) {
                const roomName = userId.toString(); // Ensure room name is a string
                console.log(`Socket ${socket.id} attempting to join room: ${roomName}`);
                socket.join(roomName);
            } else {
                console.warn(`Socket ${socket.id} tried to join room with invalid userId.`);
            }
        });


        socket.on('sendMessage', (data) => {
            console.log(`Message received from ${socket.id}:`, data);
        });


     
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

  
}; // End module.exports


// --- START OF FILE config/socket.js ---
module.exports = function(io) {

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

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
