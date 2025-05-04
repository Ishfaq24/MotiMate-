// --- START OF FILE routes/auth.js ---
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user'); // Adjust path if your models folder is elsewhere relative to routes

// GET /auth/login - Show Login Page
router.get('/login', (req, res) => {
  // Ensure you have a view file at views/auth/login.ejs
  res.render('auth/login', { title: 'Login' });
});

// POST /auth/login - Handle Login Attempt
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard', // Redirect on successful login
  failureRedirect: '/auth/login',  // Redirect back to login on failure
  failureFlash: true // Use flash messages to display errors (like 'Incorrect email or password')
}));

// GET /auth/register - Show Registration Page
router.get('/register', (req, res) => {
  // Ensure you have a view file at views/auth/register.ejs
  res.render('auth/register', { title: 'Register' });
});

// POST /auth/register - Handle Registration Attempt
router.post('/register', async (req, res, next) => { // Added next for error handling
  const { username, email, password, password2 } = req.body; // Assuming you have a password confirmation field
  let errors = [];

  // --- Basic Server-Side Validation ---
  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password && password.length < 6) { // Example minimum length
    errors.push({ msg: 'Password should be at least 6 characters' });
  }
  // --- More validation can be added ---


  if (errors.length > 0) {
    // Re-render registration page with errors and previous input
    res.render('auth/register', {
      title: 'Register',
      errors, // Pass errors to the view
      username, // Pass back entered values
      email
    });
  } else {
    // Validation passed - check if user already exists
    try {
      const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username }] });
      if (existingUser) {
        errors.push({ msg: 'Email or Username already registered' });
        res.render('auth/register', {
          title: 'Register',
          errors,
          username,
          email
        });
      } else {
        // Create new user (password hashing is handled by the pre-save hook in models/user.js)
        const newUser = new User({
          username,
          email: email.toLowerCase(),
          password
        });
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login'); // Redirect to login page after successful registration
      }
    } catch (err) {
      console.error("Error during registration:", err);
      // It's often better to pass the error to the main error handler
      // instead of just flashing a generic message.
      // next(err);
      // Or, keep the flash message for user feedback:
      req.flash('error_msg', 'Something went wrong during registration. Please try again.');
      res.redirect('/auth/register');
    }
  }
});

// GET /auth/logout - Handle Logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) { // req.logout requires a callback function now
    if (err) {
        return next(err); // Pass error to error handler
     }
    req.flash('success_msg', 'You have successfully logged out.');
    res.redirect('/auth/login'); // Redirect to login page after logout
  });
});


module.exports = router; // Export the router object
// --- END OF FILE routes/auth.js ---