const Post = require('../models/Post');
const User = require('../models/User');

module.exports = {
    get_all_posts: async () => {
        let posts = await Post.find().exec();
        return posts;
    },
    get_all_users: async () => {
        try {
            const users = await User.find({}).exec();
            return users;
        } catch (err) {
            return 'error occured';
        }
    }
}