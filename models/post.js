const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const mongoosePaginate = require('mongoose-paginate');

const PostSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    images: [{ path: String, filename: String }],
    location: String,
    geometry: { // its self is point has type and coor properties
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    properties: { // description for point on map
        description: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Categories'
    },
    avgRating: {
        type: Number,
        default: 0
    },
    productScore: {
        type: Number,
        default: 0
    }
});

PostSchema.pre('remove', async function () {
    await Review.remove({
        _id: {
            $in: this.reviews
        }
    })
});

PostSchema.methods.calculateAvgRating = function () {
    let ratingsTotal = 0;
    if (this.reviews.length) {
        this.reviews.forEach(review => {
            ratingsTotal += review.rating;
        });
        this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
    } else {
        this.avgRating = ratingsTotal;
    }
    const floorRating = Math.floor(this.avgRating);
    this.save();
    return floorRating;
}

PostSchema.plugin(mongoosePaginate);

// add 2dsphere index to geometry field
// when users using filter has radius, which post has coor inside radius from input coor -> valid
PostSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Post', PostSchema);