const Post = require('../models/Post');
const Review = require('../models/Review');
const createError = require('http-errors');

module.exports = {
    // Reviews Create
    async reviewCreate(req, res, next) {
        // find the post by its id
        const post = await Post.findById(req.params.id).populate('reviews').exec();
        const haveReviewed = post.reviews.filter(review => {
            return review.author.equals(req.user._id);
        }).length;
        if (haveReviewed) {
            return next(createError(409));
        }
        req.body.review.author = req.user._id;
        // create the review
        const review = await Review.create(req.body.review);
        // assign review to post
        post.reviews.push(review);
        // save the post
        await post.save();
        post.reviewsScoreCaculate();
        res.status(200).json({});
    },
    // Reviews Update
    async reviewUpdate(req, res, next) {
        await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
        const post = await Post.findById(req.params.id).populate('reviews').exec();
        post.reviewsScoreCaculate();
        res.status(200).json({});
    },
    // Reviews Destroy
    async reviewDestroy(req, res, next) {
        await Post.findByIdAndUpdate(req.params.id, {
            $pull: { reviews: req.params.review_id }
        });
        await Review.findByIdAndRemove(req.params.review_id);
        const post = await Post.findById(req.params.id).populate('reviews').exec();
        post.reviewsScoreCaculate();
        res.status(200).json({});
    }
}