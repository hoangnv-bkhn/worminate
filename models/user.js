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

UserSchema.plugin(passportLocalMongoose, {
    usernameField: 'email', findByUsername: function (model, queryParameters) {
        queryParameters.active = true;
        return model.findOne(queryParameters);
    }
});

//Export model
module.exports = mongoose.model('User', UserSchema);