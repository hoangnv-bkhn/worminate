const User = require('../models/user');
const Post = require('../models/post');
const Categories = require('../models/categories');
const posts = require('./posts');
const { unique } = require('faker/locale/zh_TW');

module.exports = {
    async manageAdmin(req, res, next) {
        var dataUser = [];
        const users = await User.find({}, { fullName: 1, email: 1 });
        var posts;
        for (let key in users) {
            posts = await Post.find().where('author').equals(users[key]._id).exec();
            dataUser.push({
                user: users[key],
                posts: posts
            })
        }
        res.send(dataUser);
    },
    async addCategory(req, res, next) {
        const category = new Categories(req.body);
        try {
            await category.save();
        } catch (err) {
            res.send(err);
        }
        res.send(category);
    },
    async userIndex(req, res, next) {
        const { dbQuery } = res.locals;
        delete res.locals.dbQuery;
        let users = await User.paginate(dbQuery, {
            page: req.query.page || 1,
            limit: 10,
            sort: '-_id' // add - in front of field for decending order
            // in mongoose sort by id similar to sort by time that item is created
        });
        users.page = Number(users.page);
        if (!users.docs.length && res.locals.query) {
            res.locals.error = 'No results match that query';
        }
        res.send(users);
    },
    async deletePostbyId(req, res, next) {
        const post = await Post.findById(req.params.id);
        if (post) {
            post.remove();
            res.send(post);
        }
        else {
            res.send('Not Found!');
        }
    }
}