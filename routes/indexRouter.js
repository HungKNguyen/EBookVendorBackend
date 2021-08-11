const express = require('express')
const router = express.Router()
const authenticate = require('../authenticate')
const User = require('../models/users')

router.get('/public', (req, res, next) => {
  res.statusCode = 200
  res.json({ success: true, status: 'Public resources' })
})

router.get('/secret', authenticate.loggedIn, function (req, res) {
  res.statusCode = 200
  res.json({ success: true, status: 'Hidden to non-user' })
})

router.get('/supersecret', authenticate.loggedIn, authenticate.isAdmin, function (req, res) {
  res.statusCode = 200
  res.json({ success: true, status: 'Only for an admin' })
})

router.post('/login', authenticate.logInLocal,
  function (req, res) {
    const token = authenticate.getToken({ _id: req.user._id })
    res.statusCode = 200
    res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 3600 * 1000 })
    res.json({ success: true, status: 'You are successfully logged in!' })
  }
)

router.get('/login/facebook', authenticate.logInFB)

router.get('/login/facebook/callback', authenticate.logInFB, (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200
  res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 3600 * 1000 })
  res.json({ success: true, status: 'You are successfully logged in!' })
})

router.get('/login/google', authenticate.logInGOOG)

router.get('/login/google/callback', authenticate.logInGOOG, (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200
  res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 3600 * 1000 })
  res.json({ success: true, status: 'You are successfully logged in!' })
})

router.get('/logout', function (req, res) {
  req.logout()
  res.statusCode = 200
  res.clearCookie('jwt', { path: '/' })
  res.json({ success: true, status: 'You are successfully logged out!' })
})

router.post('/signup', function (req, res, next) {
  User.register(new User({ email: req.body.email }), req.body.password, (err, user) => {
    if (err) {
      res.statusCode = 500
      res.json({ err: err })
    } else {
      if (req.body.firstname) {
        user.firstname = req.body.firstname
      }
      if (req.body.lastname) {
        user.lastname = req.body.lastname
      }
      user.save((err, user) => {
        if (err) {
          res.statusCode = 500
          res.json({ err: err })
          return
        }
        authenticate.logInLocal(req, res, () => {
          const token = authenticate.getToken({ _id: req.user._id })
          res.statusCode = 200
          res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 3600 * 1000 })
          res.json({ success: true, status: 'Registration Successful!' })
        })
      })
    }
  })
})

module.exports = router
