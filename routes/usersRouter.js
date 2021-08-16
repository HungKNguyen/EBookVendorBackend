const express = require('express')
const router = express.Router()
const Users = require('../models/users')
const EBooks = require('../models/ebooks')
const authenticate = require('../authenticate')

/* GET all users - STABLE */
router.get('/', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
  Users.find({})
    .then((users) => {
      res.statusCode = 200
      res.json(users)
    }, (err) => next(err))
})

/* GET/MODIFY/DELETE own account - STABLE */
router.route('/profile')
/* GET user account - STABLE */
  .get(authenticate.loggedIn, function (req, res, next) {
    Users.findById(req.user._id)
      .then((user) => {
        res.statusCode = 200
        res.json(user)
      }, (err) => next(err))
  })
/* DELETE user account - STABLE */
  .delete(authenticate.loggedIn, (req, res, next) => {
    Users.findByIdAndRemove(req.user._id)
      .then(() => {
        req.logout()
        res.clearCookie('jwt', { path: '/' })
        res.statusCode = 200
        res.json({ message: 'You have successfully deleted your account' })
      }, (err) => next(err))
      .catch((err) => next(err))
  })
/* PUT user account - STABLE */
  .put(authenticate.loggedIn, (req, res, next) => {
    Users.findById(req.user._id)
      .then((user) => {
        if (req.body.firstname) {
          user.firstname = req.body.firstname
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname
        }
        if (req.body.email) {
          user.email = req.body.email
        }
        user.save((err) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully modified your account' })
          }
        })
      }, (err) => next(err))
  })

/* PUT to change password - STABLE */
router.put('/password', authenticate.loggedIn, (req, res, next) => {
  Users.findById(req.user._id)
    .then((user) => {
      user.changePassword(req.body.oldPassword, req.body.newPassword, function (err) {
        if (err) {
          next(err)
        } else {
          req.logout()
          res.clearCookie('jwt', { path: '/' })
          res.statusCode = 200
          res.json({ success: true, message: 'Your password has been changed successfully' })
        }
      })
    })
})

/*
GET to get list of favorite ebooks - STABLE
POST to add favorite ebook - STABLE
DELETE to delete a favorite ebook - STABLE
*/
router.route('/favorite')
  .get(authenticate.loggedIn, (req, res, next) => {
    Users.findById(req.user._id)
      .populate('favEBooks')
      .then((user) => {
        res.statusCode = 200
        res.json(user.favEBooks)
      }, (err) => next(err))
  })
  .post(authenticate.loggedIn, (req, res, next) => {
    Users.findById(req.user._id)
      .then(async (user) => {
        if (user.favEBooks.indexOf(req.body.ebookId) === -1) {
          user.favEBooks.push(req.body.ebookId)
          await EBooks.findByIdAndUpdate(req.body.ebookId, { $inc: { liked: 1 } })
        }
        user.save((err) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully added the ebook from your favorite list' })
          }
        })
      }, (err) => next(err))
  })
  .delete(authenticate.loggedIn, (req, res, next) => {
    Users.findById(req.user._id)
      .then(async (user) => {
        if (user.favEBooks.indexOf(req.body.ebookId) !== -1) {
          user.favEBooks.pull(req.body.ebookId)
          await EBooks.findByIdAndUpdate(req.body.ebookId, { $inc: { liked: -1 } })
        }
        user.save((err) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully removed the ebook from your favorite list' })
          }
        })
      }, (err) => next(err))
  })

router.route('/cart')
  .get(authenticate.loggedIn, (req, res, next) => {
    Users.findById(req.user._id)
      .populate('cart')
      .then((user) => {
        res.statusCode = 200
        res.json(user.cart)
      }, (err) => next(err))
  })
  .post(authenticate.loggedIn, (req, res, next) => {
    Users.findById(req.user._id)
      .then((user) => {
        if (user.cart.indexOf(req.body.ebookId) === -1) {
          user.cart.push(req.body.ebookId)
        }
        user.save((err) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully added the ebook from your favorite list' })
          }
        })
      }, (err) => next(err))
  })
  .delete(authenticate.loggedIn, (req, res, next) => {
    Users.findById(req.user._id)
      .then((user) => {
        if (user.cart.indexOf(req.body.ebookId) !== -1) {
          user.cart.pull(req.body.ebookId)
        }
        user.save((err, user) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully removed the ebook from your favorite list' })
          }
        })
      }, (err) => next(err))
  })

router.get('/owned', authenticate.loggedIn, (req, res, next) => {
  Users.findById(req.user._id)
    .populate('ownedEBooks')
    .then((user) => {
      res.statusCode = 200
      res.json(user.ownedEBooks)
    }, (err) => next(err))
})
module.exports = router
