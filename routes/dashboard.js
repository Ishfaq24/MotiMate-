const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', async (req, res, next) => {
    try {
        const userId = req.user._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const [total, completed, pending, todayCompleted, weeklyCompleted] = await Promise.all([
            Task.countDocuments({ createdBy: userId }),
            Task.countDocuments({ createdBy: userId, completed: true }),
            Task.countDocuments({ createdBy: userId, completed: false }),
            Task.countDocuments({
                createdBy: userId,
                completed: true,
                completedAt: { $gte: today, $lt: tomorrow }
            }),
            Task.countDocuments({
                createdBy: userId,
                completed: true,
                completedAt: { $gte: startOfWeek, $lt: endOfWeek }
            })
        ]);

        const stats = {
            total: total || 0,
            completed: completed || 0,
            pending: pending || 0,
            todayCompleted: todayCompleted || 0,
            weeklyCompleted: weeklyCompleted || 0,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
        };

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const upcomingTasks = await Task.find({
            createdBy: userId,
            completed: false,
            dueDate: { $gte: today, $lt: nextWeek }
        }).sort({ dueDate: 1 });

        res.render('dashboard', {
            title: 'Dashboard',
            stats: stats,
            upcomingTasks: upcomingTasks,
            currentUser: req.user
        });

    } catch (err) {
        console.error("Error loading dashboard:", err);
        next(err);
    }
});

module.exports = router;
