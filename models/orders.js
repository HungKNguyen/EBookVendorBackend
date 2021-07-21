const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
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
    status: {
        type: Boolean,
        default: false
    },
    payment: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

var Orders = mongoose.model('Order', orderSchema)

module.exports = Orders