const express = require('express');
const passport = require('../config/passport');
const router = express.Router();

// Google Login Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback Route
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login', // Redirect on failure
    }),
    (req, res) => {
        // Redirect or send token after successful login
        res.redirect('http://localhost:3000/'); // Replace with your frontend redirect
    }
);

router.get('/check-auth', (req, res) => {
    console.log("Session:", req.session);
    console.log("User:", req.user);

    if (req.isAuthenticated()) {
        res.status(200).json({ user: req.user });
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

router.get('/current-user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            isAuthenticated: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                avatarUrl: req.user.avatarUrl,
            },
        });
        console.log(res);
    } else {
        res.json({ isAuthenticated: false, user: null });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out', error: err });
        }
        req.session.destroy(() => {
            res.clearCookie('connect.sid'); // Clear session cookie
            return res.status(200).json({ message: 'Logged out successfully' });
        });
    });
});

module.exports = router;