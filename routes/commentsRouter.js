const express = require('express')
const router = express.Router()
const Comments = require('../models/comments')
const authenticate = require('../authenticate')

/*
GET to get all comments of a book paginate - STABLE
POST to post a comment on a book - STABLE
PUT to modify your own comment - STABLE
DELETE to delete your own comment - STABLE
 */
router.route('/')
  .get((req, res, next) => {
    Comments.find({ ebook: req.body.ebookId })
      .sort({ [req.body.sort]: req.body.order })
      .skip(req.body.skip)
      .limit(10)
      .populate('user', ['firstname', 'lastname', 'image'])
      .then((comments) => {
        res.statusCode = 200
        res.json(comments)
      }, (err) => next(err))
  })
  .post(authenticate.loggedIn, (req, res, next) => {
    Comments.create({ user: req.user._id, ebook: req.body.ebookId, rating: req.body.rating, comment: req.body.comment })
      .then(() => {
        res.statusCode = 200
        res.json({ message: 'You have successfully posted the comment' })
      }, (err) => next(err))
  })
  .put(authenticate.loggedIn, (req, res, next) => {
    Comments.findById(req.body.commentId)
      .then((comment) => {
        if (comment.user.equals(req.user._id)) {
          if (req.body.rating) {
            comment.rating = req.body.rating
          }
          if (req.body.comment) {
            comment.comment = req.body.comment
          }
          comment.save((err) => {
            if (err) {
              next(err)
            } else {
              res.statusCode = 200
              res.json({ message: 'You have successfully modified the comment' })
            }
          })
        } else {
          res.statusCode = 403
          res.json({ message: 'You are not the owner of the comment' })
        }
      }, (err) => next(err))
  })
  .delete(authenticate.loggedIn, (req, res, next) => {
    Comments.findById(req.body.commentId)
      .then((comment) => {
        if (comment.user.equals(req.user._id)) {
          comment.remove((err) => {
            if (err) {
              next(err)
            } else {
              res.statusCode = 200
              res.json({ message: 'You have successfully deleted your comment' })
            }
          })
        } else {
          res.statusCode = 403
          res.json({ message: 'You are not the owner of the comment' })
        }
      }, (err) => next(err))
  })

/* DELETE admin force delete - STABLE */
router.delete('/admin', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
  Comments.findByIdAndRemove(req.body.commentId)
    .then(() => {
      res.statusCode = 200
      res.json({ message: 'You have successfully deleted the comment' })
    }, (err) => next(err))
    .catch((err) => next(err))
})

module.exports = router
