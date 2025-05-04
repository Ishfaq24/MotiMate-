// --- START OF FILE routes/tasks.js ---
const express = require('express');
const router = express.Router();
const Task = require('../models/Task'); // Correct path to Task model
const { ensureAuthenticated } = require('../middleware/auth'); // Assuming you have this middleware

// Middleware to ensure user is authenticated for all task routes
router.use(ensureAuthenticated);

// GET /tasks - Display all tasks for the logged-in user
router.get('/', async (req, res, next) => { // Added next for error handling
    try {
        const tasks = await Task.find({ createdBy: req.user._id })
                                .sort({ dueDate: 1, createdAt: -1 }); // Example sorting

        // NOTE: The original tasks.ejs template included 'stats'.
        // That data usually comes from the dashboard. If you NEED stats here,
        // you must calculate them here like in routes/dashboard.js.
        // For simplicity, I'm assuming the task view doesn't strictly need 'stats'.
        res.render('tasks/index', { // Ensure path views/tasks/index.ejs exists
            title: 'My Tasks',
            tasks: tasks,
            currentUser: req.user // Pass user if needed in the template (e.g., for header partial)
            // stats: {} // Pass empty stats or calculate if needed
        });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        req.flash('error_msg', 'Could not load tasks.');
        // Pass error to the central error handler instead of redirecting blindly
        next(err);
        // res.redirect('/dashboard'); // Avoid redirecting on server error
    }
});

// POST /tasks - Create a new task
router.post('/', async (req, res, next) => { // Added next
    const { title, description, dueDate, priority, project } = req.body; // Destructure expected fields

    // Basic validation
    if (!title || title.trim() === '') {
        // If request expects JSON (like from fetch), send JSON error
        if (req.accepts('json')) {
             return res.status(400).json({ message: 'Task title is required.' });
        }
        // Otherwise, flash message and redirect (for traditional form submits)
        req.flash('error_msg', 'Task title is required.');
        return res.redirect('/tasks');
    }

    try {
        const newTask = new Task({
            title: title.trim(),
            description, // Add other fields as needed from req.body
            dueDate: dueDate || null, // Handle optional date
            priority: priority || 'medium', // Set default if needed
            // project: project || null, // Handle optional project
            createdBy: req.user._id // Associate task with logged-in user
        });

        const savedTask = await newTask.save();

        // Check if the request expects JSON (sent via fetch from client-side JS)
        if (req.accepts('json')) {
            // FIX: Send back the created task as JSON
            return res.status(201).json(savedTask);
        } else {
            // If it was a traditional form post, redirect
            req.flash('success_msg', 'Task added successfully!');
            return res.redirect('/tasks');
        }

    } catch (err) {
        console.error('Error creating task:', err);
         // If request expects JSON, send JSON error
        if (req.accepts('json')) {
            return res.status(500).json({ message: 'Error creating task. Please try again.' });
        }
        // Otherwise, flash message and redirect
        req.flash('error_msg', 'Error creating task. Please try again.');
        // Pass error to central handler OR redirect
        // next(err); // Option 1: Use central error handler
        return res.redirect('/tasks'); // Option 2: Redirect back
    }
});

// PUT /tasks/:id - Update a task (e.g., mark as complete)
router.put('/:id', ensureAuthenticated, async (req, res, next) => {
    // Destructure *all* fields that might be sent from the edit form or completion toggle
    const { completed, title, description, dueDate, priority } = req.body;
    const taskId = req.params.id;

    try {
        // Find the task, ensure it belongs to the user
        const task = await Task.findOne({ _id: taskId, createdBy: req.user._id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission.' });
        }

        // --- Update fields based on what was sent ---
        // Check explicitly for undefined because 'false' is a valid value for 'completed'
        if (typeof completed !== 'undefined') {
            task.completed = Boolean(completed);
            task.completedAt = task.completed ? new Date() : null;
        }
        // Check if other fields were provided in the request body
        if (typeof title !== 'undefined') {
            if (!title.trim()) { // Add validation for empty title
                 return res.status(400).json({ message: 'Task title cannot be empty.' });
            }
            task.title = title.trim();
        }
        if (typeof description !== 'undefined') {
            task.description = description.trim(); // Trim description
        }
        if (typeof dueDate !== 'undefined') {
             // Allow setting dueDate to null or a valid date
            task.dueDate = dueDate ? new Date(dueDate) : null;
             // Add date validation if needed here
        }
        if (typeof priority !== 'undefined') {
            // Add validation for allowed priority values if needed
            task.priority = priority;
        }
        // Add other fields if your edit form includes them (e.g., labels, project)

        const updatedTask = await task.save(); // Save the changes

        // Send back the full updated task object as JSON
        res.status(200).json(updatedTask);

    } catch (err) {
        console.error(`Error updating task ${taskId}:`, err);
        // Check for validation errors from Mongoose
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: 'Validation failed', errors: err.errors });
        }
        // Check for CastError (invalid ObjectId format)
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid task ID format or data.' });
        }
        // General server error
        res.status(500).json({ message: 'Error updating task.' });
    }
});


// DELETE /tasks/:id - Delete a task
router.delete('/:id', async (req, res, next) => { // Added next
    const taskId = req.params.id;

    try {
        const result = await Task.deleteOne({ _id: taskId, createdBy: req.user._id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Task not found or you do not have permission.' });
        }

        // Send success response (status 204 No Content is common for DELETE)
        res.status(204).send();

    } catch (err) {
        console.error(`Error deleting task ${taskId}:`, err);
        res.status(500).json({ message: 'Error deleting task.' });
        // Or use next(err);
    }
});


module.exports = router;
// --- END OF FILE routes/tasks.js ---