const express = require('express')
const router = express.Router()
const authenticate = require('../authenticate')
const User = require('../models/users')

router.get('/public', (req, res, next) => {
  res.statusCode = 200
  res.json({ success: true, message: 'Public resources' })
})

router.get('/secret', authenticate.loggedIn, function (req, res) {
  res.statusCode = 200
  res.json({ success: true, message: 'Hidden to non-user' })
})

router.get('/supersecret', authenticate.loggedIn, authenticate.isAdmin, function (req, res) {
  res.statusCode = 200
  res.json({ success: true, message: 'Only for an admin' })
})

router.post('/login', authenticate.logInLocal,
  function (req, res) {
    const token = authenticate.getToken({ _id: req.user._id })
    res.statusCode = 200
    res.cookie('jwt', token, { httpOnly: true, maxAge: req.body.rememberMe ? 168 * 3600 * 1000 : 24 * 3600 * 1000 })
    const { hash, salt, ...profile } = req.user._doc
    res.json(profile)
  }
)

router.post('/login/facebook', authenticate.logInFB, (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200
  res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 3600 * 1000 })
  res.json(req.user)
})

router.post('/login/google', authenticate.logInGOOG, (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200
  res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 3600 * 1000 })
  res.json(req.user)
})

router.get('/logout', function (req, res) {
  req.logout()
  res.statusCode = 200
  res.clearCookie('jwt', { path: '/' })
  res.json({ success: true, message: 'You are successfully logged out!' })
})

router.post('/signup', function (req, res, next) {
  User.register(new User({
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname
  }), req.body.password, (err) => {
    if (err) {
      next(err)
    } else {
      authenticate.logInLocal(req, res, () => {
        const token = authenticate.getToken({ _id: req.user._id })
        res.statusCode = 200
        res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 3600 * 1000 })
        const { hash, salt, ...profile } = req.user._doc
        res.json(profile)
      })
    }
  })
})

module.exports = router
