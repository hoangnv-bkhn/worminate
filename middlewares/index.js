const User = require('../models/User');
const Post = require('../models/Post');
const Review = require('../models/Review');
const createError = require('http-errors');
const { cloudinary } = require('../cloudinary');

escapeRegExp = (str) => {
    // $& means the whole matched string
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    asyncErrorHandler: (fn) => async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            try {
                if (req.file) {
                    await cloudinary.uploader.destroy(req.file.filename);
                } else if (req.files) {
                    for (const file of req.files) {
                        await cloudinary.uploader.destroy(file.filename);
                    }
                }
            } catch (err) {
                return next(createError(err));
            }
            next(createError(err));
        }
    },
    deleteImageCloudinary: async (filename) => {
        await cloudinary.uploader.destroy(filename);
    },
    isValidPassword: async (req, res, next) => {
        const { password } = req.body;
        const { user, error } = await User.authenticate()(req.user.email, password);
        if (!user && error) {
            await cloudinary.uploader.destroy(req.file.filename);
            return next(createError(404));
        }
        else next();
    },
    isAuthor: async (req, res, next) => {
        const post = await Post.findById(req.params.id);
        if (post.author.equals(req.user._id)) {
            res.locals.post = post;
            return next();
        } else next(createError(403));
    },
    isReviewAuthor: async (req, res, next) => {
        const review = await Review.findById(req.params.review_id);
        if (review.author.equals(req.user._id)) {
            return next();
        } else next(createError(403));
    },
    searchAndFilterPosts: async (req, res, next) => {
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length) {
            const dbQueries = [];
            let { search, price, avgRating, location, distance } = req.query;
            if (search) {
                search = new RegExp(escapeRegExp(search), 'gi');
                dbQueries.push({
                    $or: [
                        { title: search },
                        { description: search },
                        { location: search }
                    ]
                });
            }

            if (location) {
                let coordinates;
                try {
                    if (typeof JSON.parse(location) === 'number') {
                        throw new Error;
                    }
                    location = JSON.parse(location);
                    coordinates = location;
                } catch (err) {
                    const response = await geocodingClient
                        .forwardGeocode({
                            query: location,
                            limit: 1
                        })
                        .send();
                    coordinates = response.body.features[0].geometry.coordinates;
                }
                let maxDistance = distance || 25;
                maxDistance *= 1000; // convert kilometers to meters
                dbQueries.push({
                    geometry: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates
                            },
                            $maxDistance: maxDistance
                        }
                    }
                });
            }

            if (price) {
                if (price.min) {
                    dbQueries.push({ price: { $gte: Number(price.min) } });
                }
                if (price.max) {
                    dbQueries.push({ price: { $lte: Number(price.max) } });
                }
            }

            if (avgRating) {
                dbQueries.push({ avgRating: { $in: avgRating } });
            }

            res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
        }

        next();
    }
}