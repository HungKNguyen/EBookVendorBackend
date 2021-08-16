const express = require('express')
const router = express.Router()
const Reviews = require('../models/reviews')
const authenticate = require('../authenticate')

/*
GET to get all reviews -STABLE
POST to post new review -STABLE
PUT to modify user review -STABLE
DELETE to delete user review -STABLE
 */
router.route('/')
  .get((req, res, next) => {
    Reviews.find({})
      .sort({ [req.body.sort]: req.body.order })
      .skip(req.body.skip)
      .limit(10)
      .populate('user', ['firstname', 'lastname', 'image'])
      .then((reviews) => {
        res.statusCode = 200
        res.json(reviews)
      }, (err) => next(err))
  })
  .post(authenticate.loggedIn, (req, res, next) => {
    Reviews.create({ user: req.user._id, rating: req.body.rating, review: req.body.review })
      .then(() => {
        res.statusCode = 200
        res.json({ message: 'You have successfully posted the review' })
      }, (err) => next(err))
  })
  .put(authenticate.loggedIn, (req, res, next) => {
    Reviews.findById(req.body.reviewId)
      .then((review) => {
        if (review.user.equals(req.user._id)) {
          if (req.body.rating) {
            review.rating = req.body.rating
          }
          if (req.body.review) {
            review.review = req.body.review
          }
          review.save((err) => {
            if (err) {
              next(err)
            } else {
              res.statusCode = 200
              res.json({ message: 'You have successfully modified your review' })
            }
          })
        } else {
          res.statusCode = 403
          res.json({ message: 'You are not the owner of the review' })
        }
      }, (err) => next(err))
  })
  .delete(authenticate.loggedIn, (req, res, next) => {
    Reviews.findById(req.body.reviewId)
      .then((review) => {
        if (review.user.equals(req.user._id)) {
          review.remove((err) => {
            if (err) {
              next(err)
            } else {
              res.statusCode = 200
              res.json({ message: 'You have successfully deleted your review' })
            }
          })
        } else {
          res.statusCode = 403
          res.json({ message: 'You are not the owner of the review' })
        }
      }, (err) => next(err))
  })

router.put('/admin', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
  Reviews.findByIdAndUpdate(req.body.reviewId, { featured: req.body.featured })
    .then(() => {
      res.statusCode = 200
      res.json({ message: 'You have successfully featured/unfeatured the review' })
    }, (err) => next(err))
})

router.get('/featured', (req, res, next) => {
  Reviews.find({ featured: true })
    .populate('user', ['firstname', 'lastname', 'image'])
    .then((reviews) => {
      res.statusCode = 200
      res.json(reviews)
    }, (err) => next(err))
})

router.get('/user', authenticate.loggedIn, (req, res, next) => {
  Reviews.findOne({ user: req.user._id })
    .then((review) => {
      res.statusCode = 200
      res.json(review)
    }, (err) => next(err))
})

module.exports = router
