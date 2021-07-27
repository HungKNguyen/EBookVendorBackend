const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ebookSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    ISBN: {
        type: String,
        required: true,
        unique: true
    },
    sold: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

var EBooks = mongoose.model('EBook', ebookSchema)

module.exports = EBooks