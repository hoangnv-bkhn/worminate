const User = require('../models/user');
const Post = require('../models/post');
const Categories = require('../models/categories');
const passport = require('passport');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const util = require('util');
const { cloudinary } = require('../cloudinary');
const { deleteProfileImage } = require('../middleware');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
    //GET /
    async landingPage(req, res, next) {
        const posts = await Post.find({});
        res.render('index', { posts, mapBoxToken, title: 'Worminate - Home' });
    },
    // GET /register
    getRegister(req, res, next) {
        var socialnetId;
        res.render('register', { title: 'Register', fullName: '', email: '', socialnetId });
    },
    // POST /register
    async postRegister(req, res, next) {
        try {
            if (req.file) {
                const { path, filename } = req.file;
                req.body.image = { path, filename };
            }
            if (req.body.socialnetId) {
                var socialnetId = JSON.parse(req.body.socialnetId);
                delete req.body.socialnetId;
                req.body.socialnetId = socialnetId;
            }
            const user = await User.register(new User(req.body), req.body.password);
            req.login(user, function (err) {
                if (err) return next(err);
                req.session.success = `Welcome to Worminate, ${user.fullName}`;
                res.redirect('/');
            });
        } catch (err) {
            deleteProfileImage(req);
            const { fullName, email } = req.body;
            var socialnetId;
            let error = err.message;
            if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
                error = 'A user with the given email already registered';
            }
            res.render('register', { title: 'Register', fullName, email, error, socialnetId });
        }
    },
    // GET /login
    getLogin(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/');
        }
        if (req.query.returnTo) {
            req.session.redirectTo = req.headers.referer;
        }
        res.render('login', { title: 'Login' });
    },
    // POST /login
    async postLogin(req, res, next) {
        // passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/' })(req, res, next);
        const { email, password } = req.body;
        const { user, error } = await User.authenticate()(email, password);
        if (!user && error) return next(error);
        req.login(user, function (err) {
            if (err) return next(err);
            req.session.success = `Welcome back, ${user.fullName}!`;
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        })
    },
    //GET /login with facebook
    async postLoginFacebook(req, res, next) {
        var socialnetId = {
            "facebookId": req.user.socialnetId.facebookId
        };
        const { fullName, email } = req.user;
        const user = await User.findOne({ "socialnetId.facebookId": socialnetId.facebookId });
        if (user) {
            if (req.user.image.path) {
                if (user.image.path == process.env.USER_IMAGE_PATHS) {
                    user.image.path = req.user.image.path;
                    await user.save();
                }
            }
            req.session.success = `Welcome back, ${user.fullName}!`;
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        }
        else {
            req.logout();
            socialnetId = JSON.stringify(socialnetId);
            res.render('register', { title: 'Register', fullName: fullName, email: email, socialnetId });
        }
    },
    //GET /link with facebook
    async getLinkWithFacebook(req, res, next) {
        const userLoggedIn = await User.findOne({ email: req.user.email });
        if (userLoggedIn.socialnetId.facebookId) {
            req.session.success = 'Account linked facebook';
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        } else {
            passport.authenticate('facebook', { failureRedirect: '/login' }, async (err, user, info) => {
                var socialnetId = user.socialnetId;
                userLoggedIn.socialnetId.facebookId = socialnetId.facebookId;
                await userLoggedIn.save();
            })(req, res, next);
            req.session.success = 'Success';
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        }
    },
    //GET /login with google
    async postLoginGoogle(req, res, next) {
        var socialnetId = {
            "googleId": req.user.socialnetId.googleId
        };
        const { fullName, email } = req.user;
        const user = await User.findOne({ "socialnetId.googleId": socialnetId.googleId });
        if (user) {
            if (req.user.image.path) {
                if (user.image.path == process.env.USER_IMAGE_PATHS) {
                    user.image.path = req.user.image.path;
                    await user.save();
                }
            }
            req.session.success = `Welcome back, ${user.fullName}!`;
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        }
        else {
            req.logout();
            socialnetId = JSON.stringify(socialnetId);
            res.render('register', { title: 'Register', fullName: fullName, email: email, socialnetId });
        }
    },
    //GET /link with google
    async getLinkWithGoogle(req, res, next) {
        const userLoggedIn = await User.findOne({ email: req.user.email });
        if (userLoggedIn.socialnetId.googleId) {
            req.session.success = 'Account linked google';
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        } else {
            passport.authenticate('google', { failureRedirect: '/login' }, async (err, user, info) => {
                var socialnetId = user.socialnetId;
                userLoggedIn.socialnetId.googleId = socialnetId.googleId;
                await userLoggedIn.save();
            })(req, res, next);
            req.session.success = 'Success';
            const redirectUrl = req.session.redirectTo || '/';
            delete req.session.redirectTo;
            res.redirect(redirectUrl);
        }
    },
    // GET /logout
    getLogout(req, res, next) {
        req.logout();
        res.redirect('/');
    },
    async getProfile(req, res, next) {
        const posts = await Post.find().where('author').equals(req.user._id).limit(10).exec();
        var social;
        if (req.user.socialnetId.facebookId && req.user.socialnetId.googleId) social = 0;
        else if (req.user.socialnetId.facebookId) social = 1;
        else if (req.user.socialnetId.googleId) social = 2;
        else social = 3;
        res.render('profile', { posts, social });
    },
    async updateProfile(req, res, next) {
        const {
            fullName
        } = req.body;
        const { user } = res.locals;
        if (fullName) {
            user.fullName = fullName;
        }
        if (req.file) {
            if (user.image.filename) {
                await cloudinary.uploader.destroy(user.image.filename);
            }
            const { path, filename } = req.file;
            user.image = { path, filename };
        }
        await user.save();
        const login = util.promisify(req.login.bind(req));
        await login(user);
        req.session.success = "Profile successfully updated!";
        res.redirect("/profile");
    },
    getForgotPw(req, res, next) {
        res.render('users/forgot');
    },
    async putForgotPw(req, res, next) {
        const token = await crypto.randomBytes(20).toString('hex');
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            req.session.error = 'No account with that email address exists.'
            return res.redirect('/forgot-password');
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const msg = {
            to: email,
            from: 'Worminate Admin <tokyo.example@gmail.com>',
            subject: 'Worminate - Forgot Password / Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it into your browser to complete the process:
			https://${req.headers.host}/reset/${token}
			If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/			/g, '')
        };

        await sgMail.send(msg);

        req.session.success = `An e-mail has been sent to ${email} with further instructions.`;
        res.redirect('forgot-password');
    },
    async getReset(req, res, next) {
        const { token } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            req.session.error = 'Password reset token is invalid or has expired.!';
            return res.redirect('/forgot-password');
        }
        res.render('users/reset', { token });
    },
    async putReset(req, res, next) {
        const { token } = req.params;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            req.session.error = 'Password reset token is invalid or has expired.';
            console.log(123456789);
            return res.redirect(`/reset/${token}`);
        }
        if (req.body.password === req.body.confirm) {
            await user.setPassword(req.body.password);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();
            const login = util.promisify(req.login.bind(req));
            await login(user);
        } else {
            req.session.error = 'Password do not match.';
            return res.redirect(`/reset/${token}`);
        }

        const msg = {
            to: user.email,
            from: 'Worminate Admin <tokyo.example@gmail.com>',
            subject: 'Worminate - Password Changed',
            text: `Hello,
            This email is to confirm that the password for your account has just been changed.
            If you did not make this change, please hit reply and notify us at once.`.replace(/            /g, '')
        };
        await sgMail.send(msg);

        req.session.success = 'Password successfully updated.';
        res.redirect('/');
    }
}