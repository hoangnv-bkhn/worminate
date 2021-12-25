// Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = "mongodb+srv://dungUser:dungNt2000@cluster0.vkheq.mongodb.net/dbWorminate?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () { console.log('MongoDB connection open'); });

var gracefulExit = function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection with DB is disconnected through app termination');
        process.exit(0);
    });
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

const Post = require('../models/Post');
const User = require('../models/User');

module.exports = {
    get_all_posts: async () => {
        let posts = await Post.find({}).populate('author', 'userRank').exec();
        return posts;
    },
    get_all_users: async () => {
        const users = await User.find({}).exec();
        return users
    }
}

