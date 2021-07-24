const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ebooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EBook',
        required: true
    }],
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