const Post = require('../models/Post');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_ACCESS_TOKEN });

module.exports = {
    //GET /posts
    // postIndex: async (req, res, next) => {
    // },
    //GET /posts/new
    // postNew: (req, res, next) => {
    // },
    //POST /posts/new
    postCreate: async (req, res, next) => {
        req.body.post.images = [];
        for (const file of req.files) {
            req.body.post.images.push({
                path: file.path,
                filename: file.filename
            });
        }
        let response = await geocodingClient.forwardGeocode({
            query: req.body.post.location,
            limit: 1
        }).send();
        req.body.post.geometry = response.body.features[0].geometry;
        req.body.post.author = req.user._id;
        const post = new Post(req.body.post);
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
        await post.save();
        res.json({ detail: 'Post saved successfully.' });
    },
    //POST /posts/:id
    // postShow: async (req, res, next) => {
    //     const post = await Post.findById(req.params.id).populate({
    //         path: 'reviews',
    //         options: { sort: { '_id': -1 } },
    //         populate: {
    //             path: 'author',
    //             model: 'User'
    //         }
    //     });
    // },
    //DELETE /posts/:id
    // postDestroy: async (req, res, next) => {
    // }
}