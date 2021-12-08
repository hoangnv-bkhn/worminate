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
        reviews: [{
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }]
    }
);

PostSchema.plugin(mongoosePaginate);

//Export model
module.exports = mongoose.model('Post', PostSchema);