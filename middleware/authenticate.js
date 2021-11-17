const passport = require('passport');
const User = require('../models/user');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.facebookPassport = passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['displayName', 'emails', 'photos']
},
    function (accessToken, refreshToken, profile, done) {
        User.findOne({ "socialnetId.facebookId": profile.id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                user.image.path = profile.photos[0].value;
                return done(null, user);
            }
            else {
                user = new User();
                user.fullName = profile.displayName;
                if (profile.emails[0].value) {
                    user.email = profile.emails[0].value;
                }
                user.socialnetId.facebookId = profile.id;
                if (profile.photos[0].value) {
                    user.image.path = profile.photos[0].value;
                }
                return done(null, user);
            }
        });
    }
));

exports.googlePassport = passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
    function (accessToken, refreshToken, profile, done) {
        User.findOne({ "socialnetId.googleId": profile.id }, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                user.image.path = profile.photos[0].value;
                return done(null, user);
            }
            else {
                user = new User();
                user.fullName = profile.displayName;
                user.email = profile.emails[0].value;
                user.socialnetId.googleId = profile.id;
                if (profile.photos[0].value) {
                    user.image.path = profile.photos[0].value;
                }
                return done(null, user);
            }
        });
    }
));