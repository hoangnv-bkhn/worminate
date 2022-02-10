const Post = require('../models/Post');
const Category = require('../models/Category');
const createError = require('http-errors');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_ACCESS_TOKEN });
const { validationResult } = require('express-validator');

const {
    deleteImageCloudinary
} = require('../middlewares');

const {
    update_one_post_score
} = require('../services/calculate_score_service');

time_now = () => {
    const timeNow = new Date(Date.now());
    return new Date(timeNow.getFullYear() + '/' + (timeNow.getMonth() + 1) + '/' + timeNow.getDate());
}

module.exports = {
    //GET /api/posts
    postIndex: async (req, res, next) => {
        let { dbQuery, sortQuery } = res.locals;
        delete res.locals.dbQuery;
        delete res.locals.sortQuery;
        if (sortQuery) {
            sortQuery = sortQuery.toString();
        } else {
            sortQuery = '-postScore';
        }
        let posts = await Post.paginate(dbQuery, {
            populate: [
                {
                    path: 'author',
                    select: 'fullName admin active',
                    match: { active: true, admin: false }
                },
                {
                    path: 'category',
                    select: 'name'
                }
            ],
            page: req.query.page || 1,
            limit: 12,
            sort: sortQuery /* add - in front of field for decending order
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
        const category = await Category.find({}).sort({ name: 1 }).exec();
        res.status(200).json({ category: category });
    },
    //POST /api/posts
    postCreate: async (req, res, next) => {
        // req.body.post.images = [];
        // if (req.files) {
        //     for (const file of req.files) {
        //         req.body.post.images.push({
        //             path: file.path,
        //             filename: file.filename
        //         });
        //     }
        // }
        let response = await geocodingClient.forwardGeocode({
            query: req.body.post.location,
            limit: 1
        }).send();
        try {
            const post = new Post({
                title: req.body.post.title,
                price: req.body.post.price,
                description: req.body.post.description,
                images: req.body.post.images,
                location: req.body.post.location,
                geometry: response.body.features[0].geometry,
                category: req.body.post.category,
                author: req.user._id
            });
            const user = req.user;
            user.postList.push(post._id);
            post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
            const date = time_now();
            date.setDate(date.getDate() - 29);
            for (let i = 0; i < 30; i++) {
                post.hitCounter.set(date.toUTCString(), '0');
                date.setDate(date.getDate() + 1);
            }
            await post.save();
            await user.save();
            res.status(200).json({ post: { _id: post._id } });
        } catch (err) {
            return res.status(400).json({});
        }
    },
    //GET /posts/:id
    postShow: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({});
        }
        const post = await Post.findById(req.params.id).populate(
            [
                {
                    path: 'reviews',
                    options: { sort: { '_id': -1 } },
                    populate: {
                        path: 'author',
                        select: ['fullName', 'image']
                    }
                },
                {
                    path: 'author',
                    select: ['fullName', 'image']
                },
                {
                    path: 'category',
                    select: 'name'
                }
            ]
        ).select('-createdAt -postScore').exec();
        if (!post) return next(createError(404));
        const date = time_now();
        const dateOld = new Date(date - 29 * 1000 * 60 * 60 * 24);
        let count = 1;
        if (post.hitCounter.has(date.toUTCString())) {
            count = parseInt(post.hitCounter.get(date.toUTCString()), 10) + 1;
        }
        post.hitCounter.set(date.toUTCString(), count);
        for (let key of post.hitCounter.keys()) {
            if (new Date(key).getTime() < dateOld.getTime()) {
                post.hitCounter.delete(key);
            }
        }
        const map = new Map([]);
        for (let i = 0; i < 30; i++) {
            if (post.hitCounter.has(dateOld.toUTCString())) {
                count = post.hitCounter.get(dateOld.toUTCString());
                map.set(dateOld.toUTCString(), count);
            } else {
                map.set(dateOld.toUTCString(), '0');
            }
            dateOld.setDate(dateOld.getDate() + 1);
        }
        post.hitCounter.clear();
        post.hitCounter = map;
        await post.save();
        if (!post) return next(createError(404));
        const relatedPost = await Post.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: post.geometry.coordinates
                    },
                    query: { category: post.category._id, _id: { $ne: post._id } },
                    distanceField: "dist",
                    maxDistance: 1000 * 1000,
                    spherical: true
                }
            },
            { $sort: { postScore: -1, dist: 1 } },
            { $limit: 25 },
            { $project: { title: 1, price: 1, description: 1, images: 1, location: 1, geometry: 1, properties: 1, reviewsScore: 1 } }
        ]);
        post.hitCounter = undefined;
        res.status(200).json({ post: post, relatedPost: relatedPost });
    },
    postUpdate: async (req, res, next) => {
        const { post } = res.locals;

        if (req.body.post.deleteImages && req.body.post.deleteImages.length) {
            // assign deleteImages from req.body to its own varivable
            let deleteImages = req.body.post.deleteImages;
            // loop over deleteImages
            for (const image of deleteImages) {
                //delete images from cloudinary
                try {
                    if (image.filename) {
                        deleteImageCloudinary(image.filename);
                    }
                } catch (error) {
                    console.log('Delete by Id')
                }
                // delete image from post.images
                for (const imgPost of post.images) {
                    if (imgPost._id == image._id) {
                        let index = post.images.indexOf(imgPost);
                        post.images.splice(index, 1);
                    }
                }
            }
        }

        // if (req.files) {
        //     // upload images
        //     for (const file of req.files) {
        //         // add images to post.images array
        //         post.images.push({
        //             path: file.path,
        //             filename: file.filename
        //         });
        //     }
        // }

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

        for (const file of req.body.post.images) {
            if (!file._id) {
                post.images.push(file);
            }
        }

        // update the post with any new properties
        post.title = req.body.post.title;
        post.description = req.body.post.description;
        post.price = req.body.post.price;
        post.category = req.body.post.category;
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
        // save the updated post into the database
        await post.save();
        res.status(200).json({ post: post });
    },
    //DELETE /posts/:id
    postDestroy: async (req, res, next) => {
        const { post } = res.locals;
        for (const image of post.images) {
            if (image.filename) {
                deleteImageCloudinary(image.filename);
            }
        }
        const user = req.user;
        user.postList = user.postList.filter(p => p.toString() != post._id.toString());
        post.reviewsDelete();
        await Post.deleteOne({ _id: post._id });
        await user.save();
        res.status(200).json({});
    },
    //POST /posts/:id/favorite
    postFavorite: async (req, res, next) => {
        const { id } = req.body;
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
    },
    //DELETE /posts/:id/favorite
    deleteFavorite: async (req, res, next) => {
        const { id } = req.body;
        const user = req.user;
        let check = 0;
        user.favoritesProduct.map(item => {
            if (id == item._id.toString()) {
                user.favoritesProduct.splice(check, 1);
            }
            check++;
        });
        await user.save();
        res.status(200).json({})
    },
    //POST /api/posts/sale
    postSale: async (req, res, next) => {
        const { post } = res.locals;
        let { sale } = req.body;
        if (typeof sale === 'string') {
            sale = sale.toLowerCase();
            if (sale === 'true') sale = true;
            else sale = false;
        }
        if (typeof sale === 'boolean') {
            const user = req.user;
            if (sale == true) {
                user.salesHistory -= 1;
            } else {
                user.salesHistory += 1;
            }
            post.status = sale;
            await post.save();
            await user.save();
            return res.status(200).json({});
        } else {
            res.status(400).json({});
        }
    },
    promotionalPlan: async (req, res, next) => {
        const { post } = res.locals;
        const { promotion } = req.body;
        if (post.promotionalPlan > 0) {
            return next(createError(409));
        }
        if (promotion > 0) {
            const user = req.user;
            if (promotion == 1) user.usedTokens += 1;
            else if (promotion == 2) user.usedTokens += 3;
            else if (promotion == 3) user.usedTokens += 5;
            post.promotionalPlan = promotion;
            post.expirationDate = new Date(Date.now() + 30 * 1000 * 60 * 60 * 24);
            await post.save();
            await user.save();
            update_one_post_score(post);
            return res.status(200).json({});
        } else {
            res.status(400).json({});
        }
    }
}