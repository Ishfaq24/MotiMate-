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
  labels: [String], 
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  
  assignedTo: [{
    user: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
  }],
  
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
