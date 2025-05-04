// --- START OF FILE routes/dashboard.js ---
const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Need the Task model
const { ensureAuthenticated } = require('../middleware/auth'); // Need auth middleware

// Apply authentication middleware to the dashboard route
router.use(ensureAuthenticated);

// GET /dashboard - Display user dashboard with stats and upcoming tasks
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user._id; // Get logged-in user's ID

        // --- Calculate Statistics ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Adjust to start of week (e.g., Monday)
        startOfWeek.setHours(0,0,0,0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7); // Start of next week


        const [total, completed, pending, todayCompleted, weeklyCompleted] = await Promise.all([
            Task.countDocuments({ createdBy: userId }),
            Task.countDocuments({ createdBy: userId, completed: true }),
            Task.countDocuments({ createdBy: userId, completed: false }),
            Task.countDocuments({
                createdBy: userId,
                completed: true,
                completedAt: { $gte: today, $lt: tomorrow } // Completed between start of today and start of tomorrow
            }),
             Task.countDocuments({
                createdBy: userId,
                completed: true,
                completedAt: { $gte: startOfWeek, $lt: endOfWeek } // Completed within the current week
            })
        ]);

        const stats = {
            total: total || 0,
            completed: completed || 0,
            pending: pending || 0,
            todayCompleted: todayCompleted || 0,
            weeklyCompleted: weeklyCompleted || 0,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            // Adjust weekly completion logic if needed - e.g., based on tasks due this week vs completed this week
            // weeklyCompletion: weeklyCompleted > 0 ? Math.min(Math.round((weeklyCompleted / 7) * 100), 100) : 0;
        };

        // --- Get Upcoming Tasks (Next 7 Days) ---
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const upcomingTasks = await Task.find({
            createdBy: userId,
            completed: false,
            dueDate: { $gte: today, $lt: nextWeek } // Due date is between today (inclusive) and 7 days from now (exclusive)
        }).sort({ dueDate: 1 }); // Sort by due date ascending


        // Render the dashboard view
        res.render('dashboard', { // Assuming views/dashboard.ejs exists
            title: 'Dashboard',
            stats: stats,
            upcomingTasks: upcomingTasks,
            currentUser: req.user
        });

    } catch (err) {
        console.error("Error loading dashboard:", err);
        next(err); // Pass error to the central error handler
    }
});

module.exports = router;
// --- END OF FILE routes/dashboard.js ---