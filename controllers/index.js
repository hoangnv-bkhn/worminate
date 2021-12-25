const User = require('../models/User');
const Post = require('../models/Post');
const createError = require('http-errors');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const {
    deleteImageCloudinary
} = require('../middlewares');

const {
    getToken,
    decodeToken
} = require('../middlewares/authenticate');

activeToken = async (email, msg, token, fn) => {
    /* If fn = true => active account
    Else => forgot password */
    const user = await User.findOne({ email });
    if (user && ((fn && !user.active) || (!fn && user.active))) {
        user.accountToken = token;
        user.accountTokenExpires = Date.now() + 3600000;
        await user.save();
        await sgMail.send(msg);
    }
}

activeAccount = (email, req) => {
    const token = crypto.randomBytes(20).toString('hex');
    const msg = {
        to: email,
        from: 'Worminate Admin <tokyo.example@gmail.com>',
        subject: 'Worminate - Active Account',
        text: `You are receiving this because you (or someone else) have requested to activate your account.
        Please click on the following link, or copy and paste it into your browser to complete the process:
        http://${req.headers.host}/api/active-account/${token}
        If you did not request this, please ignore this email.`.replace(/			/g, '')
    };
    activeToken(email, msg, token, true);
}

module.exports = {
    //GET /api
    landingPage: async (req, res, next) => {
        const posts = await Post.find({}).limit(200).exec();
        res.status(200).json({ posts: posts });
    },
    //POST /api/user
    postRegister: async (req, res, next) => {
        if (req.file) {
            const { path, filename } = req.file;
            req.body.image = { path, filename };
        }
        const user = await User.register(new User(req.body), req.body.password);
        activeAccount(user.email, req);
        res.status(200).json({});
    },
    //POST /api/login
    postLogin: async (req, res, next) => {
        const { email, password } = req.body;
        const { user, error } = await User.authenticate()(email, password);
        if (!user && error) return next(createError(404));
        const sessionToken = crypto.randomBytes(20).toString('hex');
        user.sessionToken.push({ token: sessionToken });
        await user.save();
        const token = getToken({ _id: user._id, sessionToken: sessionToken });
        res.status(200).json({ user: user, token: token });
    },
    //POST /api/logout
    postLogout: async (req, res, next) => {
        const { token } = req.body;
        const { sessionToken, _id } = decodeToken(token);
        const user = await User.findOne({ _id });
        user.sessionToken = user.sessionToken.filter(session => session.token != sessionToken);
        await user.save();
        res.status(200).json({});
    },
    //GET /api/user/{userId}
    getProfile: async (req, res, next) => {
        if (req.user.admin) {
            let { id } = req.params;
            let user = await User.findOne({ _id: id });
            let posts = await Post.find().where('author').equals(id).limit(10).exec();
            res.status(200).json({ user: user, posts: posts })
        } else {
            let posts = await Post.find().where('author').equals(req.user._id).limit(10).exec();
            res.status(200).json({ posts: posts });
        }
    },
    //PUT /api/user
    updateProfile: async (req, res, next) => {
        const { fullName, newPassword } = req.body;
        const user = req.user;
        if (fullName) {
            user.fullName = fullName;
        }
        if (req.file) {
            if (user.image.filename) {
                deleteImageCloudinary(user.image.filename);
            }
            const { path, filename } = req.file;
            user.image = { path, filename };
        }
        if (newPassword) await user.setPassword(newPassword);
        if (fullName || req.file || newPassword) await user.save();
        res.status(200).json({ user: user });
    },
    //GET /api/active-account/{token}
    getActiveAccount: async (req, res, next) => {
        const { token } = req.params;
        const user = await User.findOne({
            accountToken: token,
            accountTokenExpires: { $gt: Date.now() }
        });
        if (!user) {
            return next(createError(404));
        }
        user.accountToken = null;
        user.accountTokenExpires = null;
        user.active = true;
        await user.save();
        res.status(200).json({});
    },
    //POST /api/forgot-password
    postForgotPw: async (req, res, next) => {
        const { email } = req.body;
        const token = crypto.randomBytes(20).toString('hex');
        const msg = {
            to: email,
            from: 'Worminate Admin <tokyo.example@gmail.com>',
            subject: 'Worminate - Forgot Password / Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it into your browser to complete the process:
			http://${req.headers.host}/api/reset/${token}
			If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/			/g, '')
        };
        activeToken(email, msg, token, false);
        res.status(200).json({});
    },
    //PUT /api/reset-password/{token}
    putReset: async (req, res, next) => {
        const { token } = req.params;
        const user = await User.findOne({
            accountToken: token,
            accountTokenExpires: { $gt: Date.now() }
        });
        if (!user) {
            return next(createError(404));
        }
        await user.setPassword(req.body.password);
        user.accountToken = null;
        user.accountTokenExpires = null;
        await user.save();
        const msg = {
            to: user.email,
            from: 'Worminate Admin <tokyo.example@gmail.com>',
            subject: 'Worminate - Password Changed',
            text: `Hello,
            This email is to confirm that the password for your account has just been changed.
            If you did not make this change, please hit reply and notify us at once.`.replace(/            /g, '')
        };
        await sgMail.send(msg);
        res.status(200).json({});
    }
}