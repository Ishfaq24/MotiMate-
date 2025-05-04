// --- START OF FILE models/Project.js ---
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  color: String, // Consider adding validation or default
  members: [{ // Users who are part of this project
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: { // The user who originally created it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Removed duplicate createdAt, relying on timestamps
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// Index for finding projects by creator or member
ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ members: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
// --- END OF FILE models/Project.js ---