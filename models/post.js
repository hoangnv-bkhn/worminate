const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
const Review = require('./Review');

const pointSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
);

const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 25
        },
        price: Number,
        description: String,
        images: [{
            path: String,
            filename: String
        }],
        location: String,
        /* For map */
        geometry: {
            type: pointSchema,
            index: '2dsphere',
            required: true
        },
        properties: {
            description: String
        },
        /* *** */
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'Category'
        },
        reviews: [{
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }],
        reviewsScore: {
            type: Number,
            default: 0
        },
        postScore: {
            type: Number,
            default: 0
        },
        promotionalPlan: {
            type: Number,
            enum: [0, 1, 2, 3],
            default: 0
        },
        expirationDate: {
            type: Date
        },
        hitCounter: {
            type: Map,
            of: String,
            default: {}
        },
        status: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }
);

PostSchema.methods.reviewsScoreCaculate = async function () {
    let reviewsScoreTotal = 0;
    if (this.reviews.length) {
        this.reviews.forEach(review => {
            reviewsScoreTotal += review.rating;
        });
        this.reviewsScore = Math.round((reviewsScoreTotal / this.reviews.length) * 10) / 10;
    } else {
        this.reviewsScore = reviewsScoreTotal;
    }
    // const reviewsScoreTotal = Math.floor(this.reviewsScore);
    await this.save();
    // return reviewsScoreTotal;
};

PostSchema.methods.reviewsDelete = async function () {
    await Review.deleteMany({
        _id: {
            $in: this.reviews
        }
    })
};

PostSchema.plugin(mongoosePaginate);

//Export model
module.exports = mongoose.model('Post', PostSchema);