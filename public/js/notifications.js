document.addEventListener('DOMContentLoaded', () => {
    if (typeof io === 'undefined') {
        console.error('Socket.IO client library not found. Make sure /socket.io/socket.io.js is included.');
        return;
    }

    const socket = io();
    const notificationToast = document.getElementById('notification-toast');

    function showNotification(message) {
        if (!notificationToast) {
            alert(`Notification: ${message}`);
            return;
        }
        notificationToast.textContent = message;
        notificationToast.classList.add('show');
        setTimeout(() => {
            notificationToast.classList.remove('show');
        }, 5000);
    }

    socket.on('connect', () => {
        const userId = document.body.dataset.userId;
        if (userId) {
            socket.emit('joinUserRoom', userId);
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('taskNotification', (data) => {
        if (data && data.message) {
            showNotification(data.message);
        }
    });
});
