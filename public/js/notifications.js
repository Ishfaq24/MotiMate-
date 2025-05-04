// --- START OF FILE public/js/notifications.js ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if Socket.IO is loaded
    if (typeof io === 'undefined') {
        console.error('Socket.IO client library not found. Make sure /socket.io/socket.io.js is included.');
        return;
    }

    const socket = io(); // Connect to the server
    const notificationToast = document.getElementById('notification-toast'); // Get the toast element

    // Function to display the notification
    function showNotification(message) {
        if (!notificationToast) {
            console.warn('Notification toast element (#notification-toast) not found.');
            alert(`Notification: ${message}`); // Fallback to alert
            return;
        }
        console.log('Showing notification:', message);
        notificationToast.textContent = message;
        notificationToast.classList.add('show'); // Make it visible

        // Hide after 5 seconds
        setTimeout(() => {
            notificationToast.classList.remove('show');
        }, 5000);
    }

    // --- Connection Handling ---
    socket.on('connect', () => {
        console.log('Socket connected to server:', socket.id);

        // --- Join User Room ---
        // Get user ID from a data attribute on the body tag
        const userId = document.body.dataset.userId;

        if (userId) {
            console.log(`Attempting to join room for user: ${userId}`);
            socket.emit('joinUserRoom', userId); // Tell the server which room to join
        } else {
            console.warn('User ID not found on body data-user-id attribute. Cannot join user room.');
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    // --- Listen for Notifications ---
    socket.on('taskNotification', (data) => {
        console.log('Received task notification:', data);
        if (data && data.message) {
            showNotification(data.message);
            // Optional: Add logic to update UI based on data.type ('update', 'assignment')
        }
    });

    // Optional: Listener for room join confirmation (if added in config/socket.js)
    // socket.on('roomJoined', (data) => {
    //    console.log(`Successfully joined room: ${data.room}`);
    // });

});
// --- END OF FILE public/js/notifications.js ---