const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists in DB
                let user = await User.findOne({ where: { googleId: profile.id } });
                if (!user) {
                    // Create a new user if not exists
                    user = await User.create({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        avatarUrl: profile.photos[0]?.value || null,
                        googleId: profile.id,
                    });
                }
                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);

// Serialize user
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
