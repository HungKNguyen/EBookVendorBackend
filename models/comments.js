const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ebook: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EBook',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

var Comments = mongoose.model('Comment', commentSchema)

module.exports = Comments