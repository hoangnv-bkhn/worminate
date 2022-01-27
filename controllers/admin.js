const User = require('../models/User');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

module.exports = {

    getUsers: async (req, res, next) => {
        let { dbQuery, sortQuery } = res.locals;
        delete res.locals.dbQuery;
        delete res.locals.sortQuery;
        if (sortQuery) {
            sortQuery = sortQuery.toString();
        } else {
            sortQuery = 'userScore';
        }
        let users = await User.paginate(dbQuery, {
            page: req.query.page || 1,
            limit: 12,
            sort: sortQuery /* add - in front of field for decending order
            in mongoose sort by id similar to sort by time that item is created*/
        });
        users.page = Number(users.page);
        if (!users.docs.length && req.query) {
            return res.status(200).json({});
        }
        res.status(200).json({ users: users });
    },
    postCategory: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({});
        }
        if (req.body.name) {
            const bodyCategory = {
                name: req.body.name
            }
            const category = await Category(bodyCategory);
            category.save((err, result) => {
                if (err) return next(createError(409));
                else return res.status(200).json({});
            });
        } else {
            res.status(400).json({});
        }
    },
    putCategory: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({});
        }
        if (req.body.name) {
            const category = await Category.findById(req.params.id);
            if (!category) return next(createError(404));
            category.name = req.body.name;
            category.save((err, result) => {
                if (err) return next(createError(409));
                else return res.status(200).json({});
            });

        } else {
            res.status(400).json({});
        }
    },
    deletePost: async (req, res, next) => {
        const { id } = req.body;
        const post = await Post.findById(id);
        if (!post) {
            return next(createError(404));
        }
        for (const image of post.images) {
            if (image.filename) {
                deleteImageCloudinary(image.filename);
            }
        }
        const user = await User.findById(post.author._id);
        if (user) {
            user.postList = user.postList.filter(p => p.toString() != post._id.toString());
        }
        post.reviewsDelete();
        await Post.deleteOne({ _id: post._id });
        if (user) {
            await user.save();
        }
        res.status(200).json({});
    },
    blockUser: async (req, res, next) => {
        let { id, active } = req.body;
        const user = await User.findById(id);
        if (typeof active === 'string') {
            active = active.toLowerCase();
            if (active === 'true') active = true;
            else active = false;
        }
        if (user && typeof active === 'boolean') {
            user.active = active;
            await user.save();
            return res.status(200).json({});
        } else {
            res.status(404).json({})
        }
    }
}