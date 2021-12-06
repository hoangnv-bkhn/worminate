const User = require('../models/User');
const Post = require('../models/Post');
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

activeToken = async (email, msg, fn) => {
    /* If fn = true => active account
    Else => forgot password */
    const token = crypto.randomBytes(20).toString('hex');
    const user = await User.findOne({ email });
    if (user && ((fn && !user.active) || (!fn && user.active))) {
        user.accountToken = token;
        user.accountTokenExpires = Date.now() + 3600000;
        await user.save();
        await sgMail.send(msg);
    }
}

activeAccount = (email, req) => {
    const msg = {
        to: email,
        from: 'Worminate Admin <tokyo.example@gmail.com>',
        subject: 'Worminate - Active Account',
        text: `You are receiving this because you (or someone else) have requested to activate your account.
        Please click on the following link, or copy and paste it into your browser to complete the process:
        http://${req.headers.host}/active-account/${token}
        If you did not request this, please ignore this email.`.replace(/			/g, '')
    };
    activeToken(email, msg, true);
}

module.exports = {
    //GET /
    landingPage: async (req, res, next) => {
        const posts = await Post.find({});
        res.json({ data: posts, message: 'Posts show successfully.', success: true });
    },
    //GET /register
    getRegister: (req, res, next) => {
        res.json({ message: 'Ready to register', success: true });
    },
    //POST /register
    postRegister: async (req, res, next) => {
        if (req.file) {
            const { path, filename } = req.file;
            req.body.image = { path, filename };
        }
        const user = await User.register(new User(req.body), req.body.password);
        activeAccount(user.email, req);
        res.json({ message: 'Account created successfully.', success: true });
    },
    //GET /login
    getLogin: (req, res, next) => {
        res.json({ message: 'Ready to login', success: true });
    },
    //POST /login
    postLogin: async (req, res, next) => {
        const { email, password } = req.body;
        const { user, error } = await User.authenticate()(email, password);
        if (!user && error) return next(error);
        const sessionToken = crypto.randomBytes(20).toString('hex');
        user.sessionToken.push({ token: sessionToken });
        await user.save();
        const token = getToken({ _id: user._id, sessionToken: sessionToken });
        res.json({ data: { token: token, user: user }, message: 'Account logged successfully.', success: true });
    },
    //GET /logout
    getLogout: async (req, res, next) => {
        const { token } = req.params;
        const { sessionToken, _id } = decodeToken(token);
        const user = await User.findOne({ _id });
        user.sessionToken = user.sessionToken.filter(session => session.token != sessionToken);
        await user.save();
        res.json({ message: 'Logout successfully.', success: true });
    },
    //GET /profile
    getProfile: async (req, res, next) => {
        const posts = await Post.find().where('author').equals(req.user._id).limit(10).exec();
        res.json({ user: req.user, data: posts, message: 'Profile shows successfully.', success: true });
    },
    //PUT /profile
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
        res.json({ data: user, message: 'Update profile successfully.', success: true });
    },
    //GET /active-account
    getActiveAccount: async (req, res, next) => {
        const { token } = req.params;
        const user = await User.findOne({
            accountToken: token,
            accountTokenExpires: { $gt: Date.now() }
        });
        if (!user) {
            return next(createError('Account activation error'));
        }
        user.accountToken = null;
        user.accountTokenExpires = null;
        user.active = true;
        await user.save();
        res.json({ detail: 'Account activated successfully.' });
    }
}