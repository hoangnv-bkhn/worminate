const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');
const createError = require('http-errors');

module.exports = {

    getUsers: async (req, res, next) => {
        const user = await User.find({}).limit(50).exec();
        res.status(200).json({ users: user });
    },
    postCategory: async (req, res, next) => {
        const category = await Category(req.body);
        category.save((err, result) => {
            if (err) return next(createError(409));
            else res.status(200).json({});
        });
    },
    putCategory: async (req, res, next) => {
        await Category.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({});
    }

}