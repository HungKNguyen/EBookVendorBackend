const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
    type: String,
    default: ''
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
  },
  liked: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const EBooks = mongoose.model('EBook', ebookSchema)

module.exports = EBooks
