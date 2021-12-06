const Post = require('../models/post')
const User = require('../models/user')
const Categories = require('../models/categories')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
let mapBoxToken = process.env.MAPBOX_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require('../cloudinary')

module.exports = {
    // Posts Index
    async postIndex(req, res, next) {
        const { dbQuery } = res.locals;
        let location;
        if (res.locals.dbQuery) {
            if (dbQuery['$and']) {
                for (const [key, value] of Object.entries(dbQuery['$and'])) {
                    if (value.location) {
                        location = value.location;
                        delete dbQuery['$and'][key].location;
                    }
                }
            }
        }
        delete res.locals.dbQuery;
        let posts = await Post.paginate(dbQuery, {
            page: req.query.page || 1,
            limit: 10,
            sort: '-_id' // add - in front of field for decending order
            // in mongoose sort by id similar to sort by time that item is created
        });
        posts.page = Number(posts.page);
        if (!posts.docs.length && res.locals.query) {
            res.locals.error = 'No results match that query';
        }
        console.log(posts);
        var categories = await Categories.find({}, { name: 1 });
        categories = Object.values(categories);
        for (var i = 0; i < categories.length; i++) {
            categories[i] = categories[i].name;
        }
        res.render('posts/index', {
            location,
            posts,
            categories,
            mapBoxToken,
            title: 'Posts Index'
        });
    },
    // Posts New
    postNew(req, res, next) {
        res.render('posts/new');
    },
    // Posts Create
    async postCreate(req, res, next) {
        req.body.post.images = [];
        for (const file of req.files) {
            req.body.post.images.push({
                path: file.path,
                filename: file.filename
            })
        }
        let response = await geocodingClient.forwardGeocode({
            query: req.body.post.location,
            limit: 1
        })
            .send();
        req.body.post.geometry = response.body.features[0].geometry;
        req.body.post.author = req.user._id;
        const category = await Categories.findOne({ name: req.body.post.category });
        if (category) req.body.post.category = category._id;
        else {
            req.session.success = "Category not found!";
            res.redirect(`/posts/`);
        }
        let post = new Post(req.body.post);
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
        await post.save((err, user) => {
            if (!err) {
                category.save();
            }
        });
        req.session.success = "Post created successfully!";
        res.redirect(`/posts/${post.id}`);
    },
    // Posts Show
    async postShow(req, res, next) {
        let post = await Post.findById(req.params.id).populate({
            path: 'reviews',
            options: { sort: { '_id': -1 } },
            populate: {
                path: 'author',
                model: 'User'
            }
        });
        // const floorRating = post.calculateAvgRating();
        const floorRating = post.avgRating;
        res.render('posts/show', { post, mapBoxToken, floorRating });
    },
    // Posts Edit
    async postEdit(req, res, next) {
        const category = await Categories.findById(res.locals.post.category);
        if (category) res.locals.post.categories = category.name;
        res.render('posts/edit');
    },
    // Posts Update
    async postUpdate(req, res, next) {
        // destructure post from res.locals
        const { post } = res.locals;
        // check if there's any images gor deletion
        if (req.body.deleteImages && req.body.deleteImages.length) {
            // assign deleteImages from req.body to its own varivable
            let deleteImages = req.body.deleteImages;
            // loop over deleteImages
            for (const filename of deleteImages) {
                //delete images from cloudinary
                await cloudinary.uploader.destroy(filename);
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
        const category = await Categories.findOne({ name: req.body.post.category });
        if (!category) {
            req.session.success = "Category not found!";
            res.redirect(`/posts/`);
        }
        if (post.category != category.id) {
            post.category = category.id;
        }
        post.properties.description = `<strong><a href="/posts/${post._id}">${post.title}</a></strong><p>${post.location}</p><p>${post.description.substring(0, 20)}...</p>`;
        // save the updated post into the database
        await post.save();
        // redirect to show page
        res.redirect(`/posts/${post.id}`);
    },
    // Posts Destroy
    async postDestroy(req, res, next) {
        const { post } = res.locals;
        for (const image of post.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
        await post.remove();
        req.session.success = 'Post Deleted Successfully!';
        res.redirect('/posts');
    },
    async favoritesProduct(req, res, next) {
        const { post } = res.locals;
        const user = await User.findById(post.author);
        if (user.favoritesProduct.length < 10) {
            user.favoritesProduct.push(post._id);
            await user.save();
            req.session.success = 'Post Added Successfully!';
        }
        else {
            req.session.success = 'Max Favorite!';
        }
        res.redirect(`/posts/${post.id}`);
    }
}