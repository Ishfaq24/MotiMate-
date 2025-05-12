const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { ensureAuthenticated } = require('../middleware/auth');

router.use(ensureAuthenticated);

router.get('/', (req, res) => {
    res.render('profile/index', {
        title: 'My Profile',
        currentUser: req.user
    });
});

router.post('/password', async (req, res, next) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    let errors = [];

    if (!currentPassword || !newPassword || !confirmPassword) {
        errors.push({ msg: 'Please fill in all password fields.' });
    }
    if (newPassword !== confirmPassword) {
        errors.push({ msg: 'New passwords do not match.' });
    }
    if (newPassword.length < 6) {
        errors.push({ msg: 'New password must be at least 6 characters long.' });
    }

    if (errors.length > 0) {
        req.flash('error_msg', errors.map(e => e.msg).join('<br>'));
        return res.redirect('/profile');
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/login');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            req.flash('error_msg', 'Incorrect current password.');
            return res.redirect('/profile');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        req.flash('success_msg', 'Password updated successfully!');
        res.redirect('/profile');

    } catch (err) {
        console.error("Error changing password:", err);
        req.flash('error_msg', 'An error occurred while changing password. Please try again.');
        next(err);
    }
});

module.exports = router;
