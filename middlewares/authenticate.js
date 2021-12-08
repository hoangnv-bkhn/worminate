const User = require('../models/User');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.TOKEN_SECRET;

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ _id: jwt_payload._id }, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            let check = false;
            user.sessionToken.map(sessionToken => {
                if (sessionToken.token == jwt_payload.sessionToken) {
                    check = true;
                    return;
                }
            });
            if (check) return done(null, user);
            else return done(null, false);
        } else {
            return done(null, false);
        }
    });
}));

module.exports = {
    getToken: (value) => {
        return jwt.sign(value, process.env.TOKEN_SECRET, { expiresIn: 3600 * 24 });
    },
    decodeToken: (value) => {
        return jwt.verify(value, process.env.TOKEN_SECRET);
    },
    verifyUser: passport.authenticate('jwt', { session: false, failWithError: true }),
    errorHandler: (err, req, res, next) => {
        err.status = 401;
        return next(err);
    }
}