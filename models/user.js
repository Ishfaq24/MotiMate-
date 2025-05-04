// --- START OF FILE models/user.js (Example Structure) ---
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Or your hashing library

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Ensure emails are unique
        lowercase: true, // Store emails consistently
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email format validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Example minimum length
    },
    // Add other fields like createdAt, etc.
    createdAt: {
        type: Date,
        default: Date.now
    }
    // You might add fields for projects, tasks, roles, etc. later
});

// --- Password Hashing Middleware (Before Saving) ---
// Use a pre-save hook to hash the password IF it has been modified
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err); // Pass errors to Mongoose/Express error handler
    }
});

// --- Method to Compare Passwords ---
// Add an instance method to compare the submitted password with the hashed one
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw err; // Re-throw error to be caught by caller
    }
};

// --- IMPORTANT: Define and Export the Model ONCE ---
// Check if the model already exists before trying to define it (optional safeguard)
// module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

// OR Standard way (usually sufficient if structure is correct):
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
// --- END OF FILE models/user.js ---