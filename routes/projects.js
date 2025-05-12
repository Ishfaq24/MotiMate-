const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', async (req, res, next) => {
    try {
        const projects = await Project.find({
            members: req.user._id
        }).sort({ createdAt: -1 });

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

router.get('/new', (req, res) => {
    res.render('projects/new', {
        title: 'Create New Project',
        project: {}
    });
});

router.post('/', async (req, res, next) => {
    const { name, description, color } = req.body;
    let errors = [];
    if (!name || name.trim() === '') {
        errors.push({ msg: 'Project name is required.' });
    }

    if (errors.length > 0) {
        return res.render('projects/new', {
            title: 'Create New Project',
            errors: errors,
            name: name,
            description: description,
            color: color,
            project: { name, description, color }
        });
    }

    try {
        const newProject = new Project({
            name: name.trim(),
            description: description || '',
            color: color,
            createdBy: req.user._id,
            members: [req.user._id]
        });
        await newProject.save();
        req.flash('success_msg', 'Project created successfully!');
        res.redirect('/projects');
    } catch (err) {
        console.error("Error creating project:", err);
        req.flash('error_msg', 'Failed to create project. Please try again.');
        next(err);
    }
});

router.get('/:id/edit', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            req.flash('error_msg', 'Invalid Project ID format.');
            return res.redirect('/projects');
        }

        const project = await Project.findOne({ _id: projectId, members: req.user._id });

        if (!project) {
            req.flash('error_msg', 'Project not found or you do not have permission to edit.');
            return res.redirect('/projects');
        }

        res.render('projects/edit', {
            title: `Edit Project: ${project.name}`,
            project: project
        });

    } catch (err) {
        console.error("Error fetching project for edit:", err);
        if (err.name === 'CastError') {
            req.flash('error_msg', 'Invalid Project ID.');
            return res.redirect('/projects');
        }
        req.flash('error_msg', 'Could not load project for editing.');
        next(err);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { name, description, color } = req.body;
        let errors = [];

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            req.flash('error_msg', 'Invalid Project ID format.');
            return res.redirect('/projects');
        }

        if (!name || name.trim() === '') {
            errors.push({ msg: 'Project name is required.' });
        }

        let project = await Project.findOne({ _id: projectId, members: req.user._id });

        if (!project) {
            req.flash('error_msg', 'Project not found or you do not have permission to update.');
            return res.redirect('/projects');
        }

        if (errors.length > 0) {
            return res.render('projects/edit', {
                title: `Edit Project: ${project.name}`,
                errors: errors,
                project: project
            });
        }

        project.name = name.trim();
        project.description = description || '';
        project.color = color;

        await project.save();

        req.flash('success_msg', 'Project updated successfully!');
        res.redirect(`/projects/${projectId}`);

    } catch (err) {
        console.error("Error updating project:", err);
        req.flash('error_msg', 'Failed to update project.');
        if (err.name === 'CastError') {
            req.flash('error_msg', 'Invalid Project ID.');
            return res.redirect('/projects');
        }
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            req.flash('error_msg', 'Invalid Project ID format.');
            return res.redirect('/projects');
        }

        const project = await Project.findOne({ _id: projectId, createdBy: req.user._id });

        if (!project) {
            req.flash('error_msg', 'Project not found or you do not have permission to delete.');
            return res.redirect('/projects');
        }

        const deletionResult = await Task.deleteMany({ project: projectId });
        console.log(`Deleted ${deletionResult.deletedCount} tasks associated with project ${projectId}`);

        await Project.deleteOne({ _id: projectId });

        req.flash('success_msg', 'Project and all associated tasks deleted successfully!');
        res.redirect('/projects');

    } catch (err) {
        console.error("Error deleting project:", err);
        req.flash('error_msg', 'Failed to delete project.');
        if (err.name === 'CastError') {
            req.flash('error_msg', 'Invalid Project ID.');
            return res.redirect('/projects');
        }
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            req.flash('error_msg', 'Invalid Project ID format.');
            return res.redirect('/projects');
        }

        const project = await Project.findOne({ _id: projectId, members: req.user._id });

        if (!project) {
            req.flash('error_msg', 'Project not found or access denied.');
            return res.redirect('/projects');
        }

        const tasks = await Task.find({ project: projectId }).sort({ createdAt: 1 });

        res.render('projects/show', {
            title: project.name,
            project: project,
            tasks: tasks,
            currentUser: req.user
        });

    } catch (err) {
        console.error("Error fetching project details:", err);
        if (err.name === 'CastError') {
            req.flash('error_msg', 'Invalid Project ID.');
            return res.redirect('/projects');
        }
        next(err);
    }
});

module.exports = router;
