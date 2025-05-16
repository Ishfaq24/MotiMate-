require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const socketio = require('socket.io');
const cron = require('node-cron');
const flash = require('connect-flash');
const methodOverride = require('method-override');


const User = require('./models/user'); 

const app = express();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todoist')
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => {
    console.error('!!! MongoDB connection error:', err.message); // Log specific message
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session configuration
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_key_change_in_env', // Use fallback only if .env fails
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true
    }
});
app.use(sessionMiddleware);

// Flash messages
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());


app.use(methodOverride('_method'));

// Configure Passport Local Strategy
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }
            return done(null, user);
        } catch (err) {
            console.error('Error during Passport authentication:', err);
            return done(err);
        }
    }
));

// Passport Serialization/Deserialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user); // Attaches user to req.user
    } catch (err) {
        console.error('Error during Passport deserialization:', err);
        done(err);
    }
});

// Global variables middleware for views
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Passport failureFlash message
    next();
});

app.use('/auth', require('./routes/auth'));
app.use('/tasks', require('./routes/tasks'));
app.use('/projects', require('./routes/projects'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/api', require('./routes/api'));
app.use('/profile', require('./routes/profile'));

// Basic Home Route
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/dashboard');
    } else {
        res.render('home', { title: 'Welcome' }); // Needs views/home.ejs
    }
});

app.use((req, res, next) => {
    res.status(404).render('error/404', { title: 'Page Not Found', message: 'Sorry, the page you are looking for does not exist.' }); // Needs views/error/404.ejs
});

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack || err);
    const statusCode = err.status || 500;
    if (req.accepts('json')) { // Respond with JSON if client accepts it
       return res.status(statusCode).json({
            error: 'Server Error',
            message: err.message || 'An unexpected error occurred.'
        });
    }
    res.status(statusCode).render('error/500', { // Needs views/error/500.ejs
        title: 'Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong on our end.' : err.message,
        error: process.env.NODE_ENV === 'production' ? {} : err // Pass error details only in development
    });
});

// --- Server Setup ---
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

const io = socketio(server);
app.set('socketio', io);
require('./config/socket')(io); // Load socket event handlers

if (process.env.NODE_ENV !== 'test') {
    try {
        const taskController = require('./controllers/taskController'); 
        if (taskController && typeof taskController.processRecurringTasks === 'function') {
            cron.schedule('0 0 * * *', () => { 
                taskController.processRecurringTasks()
                    .then(() => console.log('Recurring tasks processed successfully.'))
                    .catch(err => console.error('Error running recurring tasks cron job:', err));
            }, { scheduled: true, timezone: "UTC" });
            console.log('Recurring tasks cron job scheduled.');
        } else {
            console.warn('Recurring tasks function "processRecurringTasks" not found or not exported from taskController. Cron job not scheduled.');
        }
    } catch (error) {
        console.error('Failed to load taskController for cron job:', error);
    }
} else {
    console.log('Cron job scheduling disabled in test environment.');
}

module.exports = app; // Export for potential testing
