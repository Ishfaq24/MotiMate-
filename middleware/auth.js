// --- START OF FILE middleware/auth.js ---

module.exports = {
    /**
     * Middleware to ensure the user is authenticated.
     * If authenticated, proceeds to the next middleware/route handler.
     * If not authenticated, redirects to the login page with a flash message.
     */
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            // User is logged in, proceed to the requested route
            return next();
        }
        // User is not logged in
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/auth/login'); // Redirect to the login page
    },

    /**
     * Middleware to ensure the user is a guest (not authenticated).
     * If not authenticated, proceeds to the next middleware/route handler (e.g., login page).
     * If authenticated, redirects to the dashboard (or another appropriate page).
     */
    ensureGuest: function(req, res, next) {
        if (!req.isAuthenticated()) {
            // User is not logged in, allow access (e.g., to login/register pages)
            return next();
        } else {
            // User is already logged in, redirect them away from guest pages
            res.redirect('/dashboard');
        }
    }
};

module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) { // Provided by Passport
            return next();
        }
        req.flash('error_msg', 'Please log in to view this resource');
        res.redirect('/auth/login');
    },
    // ... other middleware like ensureGuest ...
};

// --- END OF FILE middleware/auth.js ---