const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const mongoosePaginate = require('mongoose-paginate');

const UserSchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    socialnetId: {
        facebookId: {
            type: String,
            unique: true,
            sparse: true
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    image: {
        path: {
            type: String,
            default: '/images/default-profile.jpg'
        },
        filename: String
    },
    admin: {
        type: Boolean,
        default: false
    },
    userScore: {
        type: Number,
        default: 0
    },
    productsScore: {
        type: Number,
        default: 0
    },
    salesHistory: {
        type: Number,
        default: 0
    },
    creditLevel: {
        type: Number,
        default: 0
    },
    favoritesProduct: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    ageAccount: {
        type: Number,
        default: Math.floor(Date.now() / 1000)
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', UserSchema);