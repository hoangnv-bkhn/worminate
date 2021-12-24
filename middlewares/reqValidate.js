const Joi = require('joi');
const createError = require('http-errors');

const {
    deleteImageCloudinary
} = require('./index');

const userSchema = Joi.object({
    fullName: Joi.string()
        .min(3)
        .max(50),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    newPassword: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'vn'] } })
})
    .with('email', ['fullName', 'password']);

const paramSchema = Joi.object({
    id: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{24}$')).required(),
    review_id: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{24}$'))
})
    .with('review_id', 'id');

module.exports = {
    validateParams: (req, res, next) => {
        const { error } = paramSchema.validate(req.params, { allowUnknown: true });
        if (error) return next(createError(400));
        else return next();
    },
    validateBody: (req, res, next) => {
        const { error } = userSchema.validate(req.body, { allowUnknown: true });
        if (error) {
            if (req.file) deleteImageCloudinary(req.file.filename);
            return next(createError(400));
        } else {
            return next();
        }
    }
}