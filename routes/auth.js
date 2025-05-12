const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

router.post('/register', async (req, res, next) => {
  const { username, email, password, password2 } = req.body;
  let errors = [];

  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' });
  }
  if (password !== password2) {
    errors.push({ msg: 'Passwords do not match' });
  }
  if (password && password.length < 6) {
    errors.push({ msg: 'Password should be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('auth/register', {
      title: 'Register',
      errors,
      username,
      email
    });
  } else {
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
        const newUser = new User({
          username,
          email: email.toLowerCase(),
          password
        });
        await newUser.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');
      }
    } catch (err) {
      console.error("Error during registration:", err);
      req.flash('error_msg', 'Something went wrong during registration. Please try again.');
      res.redirect('/auth/register');
    }
  }
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
        return next(err);
     }
    req.flash('success_msg', 'You have successfully logged out.');
    res.redirect('/auth/login');
  });
});

module.exports = router;
