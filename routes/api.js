// --- START OF FILE routes/api.js ---
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Need User model
const Task = require('../models/Task'); // Ensure Task model is required
const { ensureAuthenticated } = require('../middleware/auth'); // API endpoints often need auth

// Apply authentication middleware to all routes in this file
router.use(ensureAuthenticated);

// --- NEW ROUTE ADDED ---
// GET /api/tasks/:id - Get details for a single task
router.get('/tasks/:id', async (req, res) => { // ensureAuthenticated is already applied by router.use above
    try {
        const taskId = req.params.id;
        // Find the task ensuring it belongs to the logged-in user
        const task = await Task.findOne({ _id: taskId, createdBy: req.user._id });

        if (!task) {
            // Use 404 for not found or access denied
            return res.status(404).json({ message: 'Task not found or access denied.' });
        }

        // Send the task data back as JSON
        res.status(200).json(task);

    } catch (err) {
        console.error(`API Error fetching task ${req.params.id}:`, err);
        // Check for CastError (invalid ObjectId format) which can happen if ID is wrong length/format
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid task ID format.' });
        }
        // General server error
        res.status(500).json({ message: 'Error fetching task details.' });
    }
});
// --- END OF NEW ROUTE ---


// --- Existing Route ---
// PUT /api/user/theme - Update User Theme Preference
router.put('/user/theme', async (req, res, next) => { // next is available if you want to pass errors
    const { theme } = req.body;

    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
        return res.status(400).json({ message: 'Invalid theme value provided.' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { themePreference: theme },
            { new: true, runValidators: true } // Added runValidators for schema validation
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Theme updated successfully.', theme: user.themePreference });

    } catch (err) {
        console.error("API Error updating theme:", err);
        res.status(500).json({ message: 'Failed to update theme preference.' });
        // Or use next(err);
    }
});


// --- Add other API routes as needed below ---
// Example: GET /api/tasks/search?q=...
// Example: POST /api/tasks/:id/comments
// Example: GET /api/projects


module.exports = router;
// --- END OF FILE routes/api.js ---