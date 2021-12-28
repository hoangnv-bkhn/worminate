const Post = require('../models/Post');
const Category = require('../models/Category');
const createError = require('http-errors');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_ACCESS_TOKEN });

const {
    deleteImageCloudinary
} = require('../middlewares');

module.exports = {
    //GET /api/posts
    postIndex: async (req, res, next) => {
        const { dbQuery } = res.locals;
        delete res.locals.dbQuery;
        let posts = await Post.paginate(dbQuery, {
            populate: {
                path: 'author',
                select: 'fullName'
            },
            page: req.query.page || 1,
            limit: 10,
            sort: '-_id' /* add - in front of field for decending order
            in mongoose sort by id similar to sort by time that item is created*/
        });
        posts.page = Number(posts.page);
        if (!posts.docs.length && req.query) {
            return res.status(200).json({});
        }
        res.status(200).json({ posts: posts });
    },
    //GET /api/posts/new
    getCategory: async (req, res, next) => {
        const category = await Category.find({}).exec();
        res.status(200).json({ category: category });
    },
    //POST /api/posts
    postCreate: async (req, res, next) => {
        req.body.post.images = [];
        if (req.files) {
            for (const file of req.files) {
                req.body.post.images.push({
                    path: file.path,
                    filename: file.filename
                });
            }
        }
        let response = await geocodingClient.forwardGeocode({
            query: req.body.post.location,
            limit: 1
        }).send();
        req.body.post.geometry = response.body.features[0].geometry;
        req.body.post.author = req.user._id;
        const post = new Post(req.body.post);
        const user = req.user;
        user.postList.push(post._id);
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
        await post.save();
        await user.save();
        res.status(200).json({ post: post });
    },
    //GET /posts/:id
    postShow: async (req, res, next) => {
        const post = await Post.findById(req.params.id).populate(
            [
                {
                    path: 'reviews',
                    options: { sort: { '_id': -1 } },
                    populate: {
                        path: 'author',
                        select: 'author'
                    }
                },
                {
                    path: 'author',
                    select: 'fullName'
                },
                {
                    path: 'category',
                    select: 'name'
                }
            ]
        ).exec();
        const timeNow = new Date(Date.now());
        const date = new Date(timeNow.getFullYear() + '/' + timeNow.getMonth() + '/' + timeNow.getDate());
        let count = 1;
        if (post.hitCounter.get(date.toUTCString())) {
            count = parseInt(post.hitCounter.get(date.toUTCString()), 10) + 1;
        }
        if (post.hitCounter.size > 29) {
            const iterator = post.hitCounter.keys();
            post.hitCounter.delete(iterator.next().value);
        }
        post.hitCounter.set(date.toUTCString(), count);
        await post.save();
        if (!post) return next(createError(404));
        res.status(200).json({ post: post });
    },
    postUpdate: async (req, res, next) => {
        const { post } = res.locals;

        if (req.body.deleteImages && req.body.deleteImages.length) {
            // assign deleteImages from req.body to its own varivable
            let deleteImages = req.body.deleteImages;
            // loop over deleteImages
            for (const filename of deleteImages) {
                //delete images from cloudinary
                deleteImageCloudinary(filename);
                // delete image from post.images
                for (const image of post.images) {
                    if (image.filename === filename) {
                        let index = post.images.indexOf(image);
                        post.images.splice(index, 1);
                    }
                }
            }
        }

        if (req.files) {
            // upload images
            for (const file of req.files) {
                // add images to post.images array
                post.images.push({
                    path: file.path,
                    filename: file.filename
                });
            }
        }

        // check if location was updated
        if (req.body.post.location !== post.location) {
            let response = await geocodingClient.forwardGeocode({
                query: req.body.post.location,
                limit: 1
            })
                .send();
            post.geometry = response.body.features[0].geometry;
            post.location = req.body.post.location;
        }

        // update the post with any new properties
        post.title = req.body.post.title;
        post.description = req.body.post.description;
        post.price = req.body.post.price;
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
        // save the updated post into the database
        await post.save();
        res.status(200).json({ post: post });
    },
    //DELETE /posts/:id
    postDestroy: async (req, res, next) => {
        const { post } = res.locals;
        for (const image of post.images) {
            deleteImageCloudinary(image.filename);
        }
        const user = req.user;
        user.postList = user.postList.filter(p => p.toString() != post._id.toString());
        post.reviewsDelete();
        await Post.deleteOne({ _id: post._id });
        await user.save();
        res.status(200).json({});
    },
    //GET /posts/:id/favorite
    postFavorite: async (req, res, next) => {
        const { id } = req.params;
        const user = req.user;
        let check = 0;
        if (user.favoritesProduct.length > 9) {
            user.favoritesProduct.splice(0, 1);
        }
        user.favoritesProduct.map(item => {
            if (id == item._id.toString()) {
                check++;
            }
        });
        if (check > 0) {
            return res.status(409).json({});
        } else {
            user.favoritesProduct.push(id);
            await user.save();
        }
        res.status(200).json({});
    }
}