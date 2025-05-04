// --- START OF FILE routes/projects.js ---
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation
const Project = require('../models/Project'); // Correct path?
const Task = require('../models/Task');     // Correct path?
const { ensureAuthenticated } = require('../middleware/auth'); // Correct path?

// Apply authentication middleware to all project routes in this file
router.use(ensureAuthenticated);

// GET /projects - Display all projects the user is a member of
router.get('/', async (req, res, next) => {
    try {
        const projects = await Project.find({
            members: req.user._id
        }).sort({ createdAt: -1 });

        // --- Debugging Log Removed for brevity ---

        res.render('projects/index', {
            title: 'My Projects',
            projects: projects,
            currentUser: req.user
        });
    } catch (err) {
        console.error("Error fetching projects:", err);
        req.flash('error_msg', 'Could not load projects.');
        next(err);
    }
});

// GET /projects/new - Display form to create a new project
router.get('/new', (req, res) => {
    // Ensure you have a view file at views/projects/new.ejs
    res.render('projects/new', {
        title: 'Create New Project',
        project: {} // Pass an empty object if your form expects one
    });
});

// POST /projects - Create a new project
router.post('/', async (req, res, next) => {
    const { name, description, color } = req.body;
    let errors = [];
    if (!name || name.trim() === '') {
        errors.push({ msg: 'Project name is required.' });
    }

    if (errors.length > 0) {
        // Re-render the form with errors and existing data
        return res.render('projects/new', {
            title: 'Create New Project',
            errors: errors,
            name: name,
            description: description,
            color: color,
            project: { name, description, color } // Pass back data
        });
    }

    try {
        const newProject = new Project({
            name: name.trim(),
            description: description || '',
            color: color,
            createdBy: req.user._id,
            members: [req.user._id] // Add creator as member
        });
        await newProject.save();
        req.flash('success_msg', 'Project created successfully!');
        res.redirect('/projects');
    } catch (err) {
        console.error("Error creating project:", err);
        req.flash('error_msg', 'Failed to create project. Please try again.');
        // Optionally render form again or use error handler
        next(err);
    }
});

// --- ADDED: GET /projects/:id/edit - Show Edit Project Form ---
router.get('/:id/edit', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        // Validate ObjectId format before querying
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
             req.flash('error_msg', 'Invalid Project ID format.');
             return res.redirect('/projects');
        }

        // Find the project AND ensure the current user is a member
        const project = await Project.findOne({ _id: projectId, members: req.user._id });

        if (!project) {
            req.flash('error_msg', 'Project not found or you do not have permission to edit.');
            return res.redirect('/projects');
        }

        // Ensure you have a view file at views/projects/edit.ejs
        res.render('projects/edit', {
            title: `Edit Project: ${project.name}`,
            project: project // Pass the project data to pre-fill the form
        });

    } catch (err) {
        console.error("Error fetching project for edit:", err);
         // Handle potential CastError if validation fails unexpectedly (though checked above)
         if (err.name === 'CastError') {
             req.flash('error_msg', 'Invalid Project ID.');
             return res.redirect('/projects');
         }
        req.flash('error_msg', 'Could not load project for editing.');
        next(err); // Use central error handler
    }
});

// --- ADDED: PUT /projects/:id - Update Project ---
router.put('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { name, description, color } = req.body;
        let errors = [];

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
             req.flash('error_msg', 'Invalid Project ID format.');
             // Redirecting might lose form data, consider rendering edit form again
             return res.redirect('/projects');
        }

        if (!name || name.trim() === '') {
            errors.push({ msg: 'Project name is required.' });
        }

        // Find the project first to ensure user has permission
        let project = await Project.findOne({ _id: projectId, members: req.user._id });

        if (!project) {
            req.flash('error_msg', 'Project not found or you do not have permission to update.');
            return res.redirect('/projects');
        }

        if (errors.length > 0) {
            // Re-render edit form with errors and existing *project* data
            return res.render('projects/edit', {
                title: `Edit Project: ${project.name}`, // Use original name in title
                errors: errors,
                project: project // Pass original project data back
                // You might override specific fields if needed:
                // project: { ...project.toObject(), name: name, description: description, color: color }
            });
        }

        // Update the fields
        project.name = name.trim();
        project.description = description || '';
        project.color = color;
        // Add other fields if necessary (e.g., members - requires more logic)

        await project.save(); // Save the updated project document

        req.flash('success_msg', 'Project updated successfully!');
        res.redirect(`/projects/${projectId}`); // Redirect to the project details page

    } catch (err) {
        console.error("Error updating project:", err);
        req.flash('error_msg', 'Failed to update project.');
         // Handle potential CastError
         if (err.name === 'CastError') {
             req.flash('error_msg', 'Invalid Project ID.');
             return res.redirect('/projects');
         }
        next(err);
    }
});


// --- ADDED: DELETE /projects/:id - Delete Project ---
router.delete('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
             req.flash('error_msg', 'Invalid Project ID format.');
             return res.redirect('/projects');
        }

        // Find the project AND ensure the user is the creator (or member, based on your rules)
        // Restricting deletion to the creator is usually safer.
        const project = await Project.findOne({ _id: projectId, createdBy: req.user._id });
        // Alternative (allow any member to delete - potentially risky):
        // const project = await Project.findOne({ _id: projectId, members: req.user._id });

        if (!project) {
            req.flash('error_msg', 'Project not found or you do not have permission to delete.');
            return res.redirect('/projects');
        }

        // *** CRITICAL STEP: Delete associated tasks ***
        const deletionResult = await Task.deleteMany({ project: projectId });
        console.log(`Deleted ${deletionResult.deletedCount} tasks associated with project ${projectId}`);

        // Delete the project itself
        await Project.deleteOne({ _id: projectId });

        req.flash('success_msg', 'Project and all associated tasks deleted successfully!');
        res.redirect('/projects'); // Redirect back to the projects list

    } catch (err) {
        console.error("Error deleting project:", err);
        req.flash('error_msg', 'Failed to delete project.');
         // Handle potential CastError
         if (err.name === 'CastError') {
             req.flash('error_msg', 'Invalid Project ID.');
             return res.redirect('/projects');
         }
        next(err);
    }
});

// GET /projects/:id - Display single project details (existing route, check if needed below others)
router.get('/:id', async (req, res, next) => {
     try {
            const projectId = req.params.id;

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                 req.flash('error_msg', 'Invalid Project ID format.');
                 return res.redirect('/projects');
            }

            // Find project ensuring user is a member
            const project = await Project.findOne({ _id: projectId, members: req.user._id });

            if (!project) {
                req.flash('error_msg', 'Project not found or access denied.');
                return res.redirect('/projects');
            }
             // Find tasks for this project
            const tasks = await Task.find({ project: projectId }).sort({ createdAt: 1 });

             // Ensure you have a view file at views/projects/show.ejs
            res.render('projects/show', {
                title: project.name,
                project: project,
                tasks: tasks,
                currentUser: req.user
            });

        } catch (err) {
            console.error("Error fetching project details:", err);
             // Handle CastError
             if (err.name === 'CastError') {
                 req.flash('error_msg', 'Invalid Project ID.');
                 return res.redirect('/projects');
             }
            next(err);
        }
});


module.exports = router;
// --- END OF FILE routes/projects.js ---