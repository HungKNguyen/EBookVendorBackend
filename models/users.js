const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const User = new Schema({
  email: {
    type: String,
    default: '',
    unique: true
  },
  firstname: {
    type: String,
    default: ''
  },
  lastname: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  FbOAuth: {
    type: String
  },
  GoogleOAuth: {
    type: String
  },
  admin: {
    type: Boolean,
    default: false
  },
  favEBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EBook',
    required: true
  }],
  ownedEBooks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EBook'
  }]
}, {
  timestamps: true
})

User.plugin(passportLocalMongoose, {
  usernameField: 'email'
})

module.exports = mongoose.model('User', User)
