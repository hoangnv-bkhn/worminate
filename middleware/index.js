const Review = require('../models/review')
const User = require('../models/user')
const Post = require('../models/post')
const Categories = require('../models/categories')
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
let mapBoxToken = process.env.MAPBOX_ACCESS_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const middleware = {
    asyncErrorHandler: (fn) => async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(createError(error));
        }
    },
    isReviewAuthor: async (req, res, next) => {
        let review = await Review.findById(req.params.review_id);
        if (review.author.equals(req.user._id)) {
            return next();
        }
        req.session.error = 'Bye Bye';
        return res.redirect('/');
    },
    isLoggedInSocial: (fn) => (req, res, next) => {
        if (req.isAuthenticated()) fn(req, res, next);
        else return next();
    },
    isLoggedIn: (fn) => (req, res, next) => {
        if(req.isAuthenticated()) {
            if(fn) {
                res.redirect('/');
                return;
            }
            return next();
        }
        if(fn) {
            return next();
        }
        req.session.error = 'You need to be logged in to do that!';
        req.session.redirectTo = req.originalUrl;
        res.redirect('/login');
    },
    isAdmin: (req, res, next) => {
        if (req.isAuthenticated()) {
            if (req.user.admin) return next();
        }
        req.session.error = 'Access denied!';
        req.session.redirectTo = req.originalUrl;
        res.redirect('/');
    },
    isAuthor: async (req, res, next) => {
        const post = await Post.findById(req.params.id);
        if (post.author.equals(req.user._id)) {
            // pass post's data to the next middleware in chain, view they get rendered
            res.locals.post = post;
            return next();
        }
        req.session.error = 'Access denied!';
        res.redirect('back');
    },
    isValidPassword: async (req, res, next) => {
        const { user } = await User.authenticate()(req.user.email, req.body.currentPassword);
        if (user) {
            // add user to res.locals
            res.locals.user = user;
            next();
        } else {
            middleware.deleteProfileImage(req);
            req.session.error = "Incorrect current password!";
            return res.redirect("/profile");
        }
    },
    changePassword: async (req, res, next) => {
        const {
            newPassword,
            passwordConfirmation
        } = req.body;

        if (newPassword && !passwordConfirmation) {
            middleware.deleteProfileImage(req);
            req.session.error = 'Missing password confirmation!';
            return res.redirect('/profile');
        } else if (newPassword && passwordConfirmation) {
            const { user } = res.locals;
            if (newPassword === passwordConfirmation) {
                await user.setPassword(newPassword);
                next();
            } else {
                middleware.deleteProfileImage(req);
                req.session.error = "New passwords must match!";
                return res.redirect("/profile");
            }
        } else {
            next();
        }
    },
    deleteProfileImage: async (req) => {
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
    },
    async searchAndFilterPosts(req, res, next) {
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length) {
            const dbQueries = [];
            let { search, price, avgRating, location, distance, category } = req.query;
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

            if (category) {
                const categories = await Categories.findOne({ name: category });
                if (categories) dbQueries.push({ category: categories.id });
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
                dbQueries.push({ location: coordinates });
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

        res.locals.query = req.query;

        queryKeys.splice(queryKeys.indexOf('page'), 1);
        const delimiter = queryKeys.length ? '&' : '?';
        res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;

        next();
    },
    async SearchFilterUser(req, res, next) {
        const queryKeys = Object.keys(req.query);
        if (queryKeys.length) {
            const dbQueries = [];
            let { userScore, category, ageAccount } = req.query;

            const categories = await Categories.findOne({ name: category });
            if (categories) {
                let userList = [], flags = [];
                let posts = await Post.find().where('category').equals(categories.id);
                for (let i = 0; i < posts.length; i++) {
                    if (flags[posts[i].author]) continue;
                    flags[posts[i].author] = true;
                    userList.push(posts[i].author);
                }
                dbQueries.push({ _id: { $in: userList } });
            }

            if (userScore) {
                let min, max;
                if (userScore == 1) {
                    min = 0;
                    max = 450;
                } else if (userScore == 2) {
                    min = 451;
                    max = 800;
                } else if (userScore == 3) {
                    min = 801;
                    max = 1000;
                }
                dbQueries.push({ userScore: { $gte: Number(min), $lte: Number(max) } });
            }

            if (ageAccount) {
                ageAccount = ageAccount * 24 * 60 * 60 * 1000;
                ageAccount = Date.now() - ageAccount;
                dbQueries.push({ ageAccount: { $gte: ageAccount } });
            }

            res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {};
        }

        res.locals.query = req.query;

        queryKeys.splice(queryKeys.indexOf('page'), 1);
        const delimiter = queryKeys.length ? '&' : '?';
        res.locals.paginateUrl = req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;

        next();
    },
};

module.exports = middleware;