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

        res.render('tasks/index', { 
            title: 'My Tasks',
            tasks: tasks,
            currentUser: req.user 
           
        });
    } catch (err) {
        console.error('Error fetching tasks:', err);
        req.flash('error_msg', 'Could not load tasks.');
       
        next(err);
       
    }
});

// POST /tasks - Create a new task
router.post('/', async (req, res, next) => { // Added next
    const { title, description, dueDate, priority, project } = req.body; // Destructure expected fields

    // Basic validation
    if (!title || title.trim() === '') {
        if (req.accepts('json')) {
             return res.status(400).json({ message: 'Task title is required.' });
        }
        req.flash('error_msg', 'Task title is required.');
        return res.redirect('/tasks');
    }

    try {
        const newTask = new Task({
            title: title.trim(),
            description, 
            dueDate: dueDate || null, 
            priority: priority || 'medium', 
            createdBy: req.user._id 
        });

        const savedTask = await newTask.save();

        if (req.accepts('json')) {
            return res.status(201).json(savedTask);
        } else {
            req.flash('success_msg', 'Task added successfully!');
            return res.redirect('/tasks');
        }

    } catch (err) {
        console.error('Error creating task:', err);
        if (req.accepts('json')) {
            return res.status(500).json({ message: 'Error creating task. Please try again.' });
        }
        req.flash('error_msg', 'Error creating task. Please try again.');
        return res.redirect('/tasks'); // Option 2: Redirect back
    }
});

router.put('/:id', ensureAuthenticated, async (req, res, next) => {
    const { completed, title, description, dueDate, priority } = req.body;
    const taskId = req.params.id;

    try {
        const task = await Task.findOne({ _id: taskId, createdBy: req.user._id });

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission.' });
        }

        if (typeof completed !== 'undefined') {
            task.completed = Boolean(completed);
            task.completedAt = task.completed ? new Date() : null;
        }
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
            task.dueDate = dueDate ? new Date(dueDate) : null;
        }
        if (typeof priority !== 'undefined') {
            task.priority = priority;
        }

        const updatedTask = await task.save(); // Save the changes

        res.status(200).json(updatedTask);

    } catch (err) {
        console.error(`Error updating task ${taskId}:`, err);
        if (err.name === 'ValidationError') {
             return res.status(400).json({ message: 'Validation failed', errors: err.errors });
        }
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid task ID format or data.' });
        }
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

        res.status(204).send();

    } catch (err) {
        console.error(`Error deleting task ${taskId}:`, err);
        res.status(500).json({ message: 'Error deleting task.' });
    }
});


module.exports = router;
// --- END OF FILE routes/tasks.js ---
