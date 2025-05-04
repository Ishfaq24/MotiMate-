// --- START OF FILE routes/profile.js ---
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Or your hashing library
const User = require('../models/user'); // Adjust path as needed
const { ensureAuthenticated } = require('../middleware/auth'); // Adjust path as needed

// --- All routes in this file require authentication ---
router.use(ensureAuthenticated);

// --- GET /profile - Display Profile Page ---
router.get('/', (req, res) => {
    // req.user is typically populated by Passport after login
    res.render('profile/index', { // We'll create views/profile/index.ejs
        title: 'My Profile',
        currentUser: req.user // Pass the user object to the view
    });
});

// --- POST /profile/password - Handle Password Change ---
router.post('/password', async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id; // Get ID from the authenticated user session

    let errors = [];

    // 1. Validation Checks
    if (!currentPassword || !newPassword || !confirmPassword) {
        errors.push({ msg: 'Please fill in all password fields.' });
    }
    if (newPassword !== confirmPassword) {
        errors.push({ msg: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) { // Example: Enforce minimum length
        errors.push({ msg: 'New password must be at least 6 characters long.' });
    }

    if (errors.length > 0) {
        req.flash('error_msg', errors.map(e => e.msg).join('<br>')); // Combine messages
        return res.redirect('/profile'); // Redirect back to profile page
    }

    try {
        // 2. Fetch Full User Record (including hashed password)
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found.'); // Should not happen if logged in
            return res.redirect('/login'); // Or appropriate error page
        }

        // 3. Verify Current Password
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            req.flash('error_msg', 'Incorrect current password.');
            return res.redirect('/profile');
        }

        // 4. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 5. Update User's Password in DB
        user.password = hashedPassword;
        await user.save();

        req.flash('success_msg', 'Password updated successfully!');
        res.redirect('/profile'); // Redirect back to profile page

    } catch (err) {
        console.error("Error changing password:", err);
        req.flash('error_msg', 'An error occurred while changing password. Please try again.');
        next(err); // Or redirect to profile
    }
});


module.exports = router;
// --- END OF FILE routes/profile.js ---