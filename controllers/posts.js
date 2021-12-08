const Post = require('../models/Post');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_ACCESS_TOKEN });

module.exports = {
    //GET /posts
    postIndex: async (req, res, next) => {
        const { dbQuery } = res.locals;
        delete res.locals.dbQuery;
        let posts = await Post.paginate(dbQuery, {
            page: req.query.page || 1,
            limit: 10,
            sort: '-_id' /* add - in front of field for decending order
            in mongoose sort by id similar to sort by time that item is created*/
        });
        posts.page = Number(posts.page);
        if (!posts.docs.length && req.query) {
            res.status(404).json({ payload: {}, statusCode: 404 });
        }
        res.status(200).json({ payload: { posts: posts }, statusCode: 200 });
    },
    //POST /posts
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
        res.status(200).json({ payload: { post: post }, statusCode: 200 });
    },
    //GET /posts/:id
    postShow: async (req, res, next) => {
        const post = await Post.findById(req.params.id).populate({
            path: 'reviews',
            options: { sort: { '_id': -1 } },
            populate: {
                path: 'author',
                model: 'User'
            }
        });
        res.json({ payload: { post: post }, statusCode: 200 });
    }
    //DELETE /posts/:id
    // postDestroy: async (req, res, next) => {
    // }
}