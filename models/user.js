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
        unique: true, 
        lowercase: true, 
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'] 
    },
    password: {
        type: String,
        required: true,
        minlength: 6 // Example minimum length
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
   
});


UserSchema.pre('save', async function(next) {
    
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err); 
    }
});


UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw err; 
    }
};


module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
// --- END OF FILE models/user.js ---
