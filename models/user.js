const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 50
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        admin: {
            type: Boolean,
            default: false
        },
        active: {
            type: Boolean,
            default: false
        },
        image: {
            path: {
                type: String,
                default: 'images/default-profile.jpg'
            },
            filename: String
        },
        sessionToken: [
            {
                token: String
            }
        ],
        productsScore: {
            type: Number,
            default: 0
        },
        favoritesProduct: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Post'
            }
        ],
        salesHistory: {
            type: Number,
            default: 0
        },
        usedTokens: {
            type: Number,
            default: 0
        },
        creditLevel: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        ageAccount: {
            type: Number
        },
        userScore: {
            type: Number,
            default: 0
        },
        accountToken: String,
        accountTokenExpires: Date
    }
);

// Virtual for author's full name
// UserSchema
//     .virtual('name')
//     .get(function () {
//         return this.family_name + ', ' + this.first_name;
//     });

UserSchema.methods.caculateAge = function () {
    const ageAccount = Date.now() - this.createdAt;
    this.ageAccount = Math.floor(ageAccount / 1000);
    this.save();
}

UserSchema.plugin(passportLocalMongoose, {
    usernameField: 'email', findByUsername: function (model, queryParameters) {
        queryParameters.active = true;
        return model.findOne(queryParameters);
    }
});

//Export model
module.exports = mongoose.model('User', UserSchema);