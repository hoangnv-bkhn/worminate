const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
    {
        body: {
            type: String,
            maxLength: 50
        },
        rating: {
            type: Number,
            required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
);

//Export model
module.exports = mongoose.model('Review', ReviewSchema);