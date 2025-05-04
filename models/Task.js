// --- START OF FILE models/Task.js ---
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'], // Added error message
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  recurring: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  labels: [String], // Array of strings for labels
  project: { // Link to a Project
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project' // Refers to the 'Project' model
  },
  createdBy: { // Link to the User who created the task
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the 'User' model
    required: true
  },
  // Note: Your original schema had assignedTo as an array of objects.
  // Let's keep that structure.
  assignedTo: [{
    user: { // Link to the User it's assigned to
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // You might not need status here if 'completed' covers it,
    // but keeping it if you have specific workflow needs.
    // status: {
    //   type: String,
    //   enum: ['pending', 'in-progress', 'completed'],
    //   default: 'pending'
    // }
  }],
  // Comments structure from your earlier code
  comments: [{
    user: { // User who made the comment
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); // Adds createdAt and updatedAt automatically if you prefer that

// Add index for common queries if needed, e.g., finding tasks by user
TaskSchema.index({ createdBy: 1, completed: 1, dueDate: 1 });

module.exports = mongoose.model('Task', TaskSchema);
// --- END OF FILE models/Task.js ---