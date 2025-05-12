
module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/auth/login'); // Redirect to the login page
    },

    ensureGuest: function(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/dashboard');
        }
    }
};

module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) { 
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/auth/login');
    },
    // ... other middleware like ensureGuest ...
};

// --- END OF FILE middleware/auth.js ---
