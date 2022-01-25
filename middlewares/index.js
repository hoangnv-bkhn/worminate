const User = require('../models/User');
const Post = require('../models/Post');
const Review = require('../models/Review');
const Category = require('../models/Category');
const createError = require('http-errors');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_ACCESS_TOKEN });

escapeRegExp = (str) => {
    // $& means the whole matched string
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
    asyncErrorHandler: (fn) => async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            console.error(err);
            try {
                if (req.body.image.filename) {
                    await cloudinary.uploader.destroy(req.body.image.filename);
                } else if (req.body.images) {
                    for (const file of req.body.images) {
                        if (file.filename) {
                            await cloudinary.uploader.destroy(file.filename);
                        }
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
            if (req.body.image.filename) {
                await cloudinary.uploader.destroy(req.body.image.filename);
            }
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
    isAdmin: (req, res, next) => {
        if (req.user) {
            if (req.user.admin) return next();
        }
        next(createError(403));
    },
    isReviewAuthor: async (req, res, next) => {
        const review = await Review.findById(req.params.review_id);
        if (review.author.equals(req.user._id)) {
            return next();
        } else next(createError(403));
    },
    searchAndFilterPosts: async (req, res, next) => {
        const queryKeys = Object.keys(req.query);
        const dbQueries = [];
        if (!req.user) {
            dbQueries.push({ status: true });
        }
        if (queryKeys.length) {
            let { search, price, avgRating, location, distance, category, sortby } = req.query;
            let { postScore, promotionalPlan, expirationDate, status, createdAt } = req.query;
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
                dbQueries.push({
                    geometry: {
                        $geoWithin: {
                            $centerSphere: [coordinates, maxDistance / 6378.1]
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
                dbQueries.push({ reviewsScore: { $in: avgRating } });
            }

            if (category) {
                let category_schema = await Category.findOne({ name: category }).exec();
                if (category_schema) {
                    dbQueries.push({ category: category_schema._id });
                }
            }

            if (req.user) {
                if (postScore) {
                    dbQueries.push({ postScore: { $gte: postScore } });
                }

                if (promotionalPlan) {
                    dbQueries.push({ promotionalPlan: promotionalPlan });
                }

                if (expirationDate) {
                    expirationDate = new Date(expirationDate);
                    dbQueries.push({ expirationDate: { $gte: expirationDate.toUTCString() } });
                }

                if (status) {
                    dbQueries.push({ status: status.toLowerCase() });
                }

                if (createdAt) {
                    createdAt = new Date(createdAt);
                    dbQueries.push({ createdAt: { $gte: createdAt.toUTCString() } });
                }
            }

            const sortQuery = [];

            if (req.user && sortby) {
                sortQuery.push(sortby.toString());
            } else if (sortby) {
                if (sortby == 0) {
                    //newest
                    sortQuery.push('-createdAt');
                } else if (sortby == 1) {
                    sortQuery.push('createdAt');
                } else if (sortby == 2) {
                    //cheapest
                    sortQuery.push('price');
                } else {
                    sortQuery.push('-price');
                }
            }

            res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
            res.locals.sortQuery = sortQuery;

        }

        next();
    },
    searchAndFilterUsers: async (req, res, next) => {
        const queryKeys = Object.keys(req.query);

        if (queryKeys.length) {
            const dbQueries = [];
            let { search, createdAt, userRank, salesHistory, usedTokens, sortby } = req.query;

            if (search) {
                search = new RegExp(escapeRegExp(search), 'gi');
                dbQueries.push({
                    $or: [
                        { email: search },
                        { fullName: search }
                    ]
                });
            }

            if (createdAt) {
                createdAt = new Date(createdAt);
                dbQueries.push({ createdAt: { $gte: createdAt.toUTCString() } });
            }

            if (userRank) {
                dbQueries.push({ userRank: userRank })
            }

            if (salesHistory) {
                dbQueries.push({ salesHistory: { $gte: salesHistory } });
            }

            if (usedTokens) {
                dbQueries.push({ usedTokens: { $gte: usedTokens } });
            }

            const sortQuery = []

            if (req.user && sortby) {
                sortQuery.push(sortby.toString());
            }

            res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
            res.locals.sortQuery = sortQuery;

        }

        next();
    }
}