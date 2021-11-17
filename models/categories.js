const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategoriesSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('Categories', CategoriesSchema);