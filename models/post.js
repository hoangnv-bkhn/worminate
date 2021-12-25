const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

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
        productScore: {
            type: Number,
            default: 0
        },
        bonusLevel: {
            type: Number,
            default: 0
        },
        trendingPost: {
            type: Number,
            default: 0
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

PostSchema.pre('remove', async function () {
    await Review.remove({
        _id: {
            $in: this.reviews
        }
    })
});

PostSchema.plugin(mongoosePaginate);

//Export model
module.exports = mongoose.model('Post', PostSchema);