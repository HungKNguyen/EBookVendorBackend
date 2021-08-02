var express = require('express');
var router = express.Router();
var Comments = require('../models/comments');
var authenticate = require('../authenticate');

/*
GET to get all comments of a book - STABLE
POST to post a comment on a book - STABLE
PUT to modify your own comment - STABLE
DELETE to delete your own comment - STABLE
 */
router.route('/')
    .get( (req, res, next) => {
        Comments.find({ebook: req.body.ebookId})
            .populate('user', ['firstname', 'lastname', 'image'])
            .then((comments) => {
                res.statusCode = 200;
                res.json(comments);
            }, (err) => next(err))
    })
    .post(authenticate.loggedIn, (req, res, next) => {
        Comments.create({user: req.user._id, ebook: req.body.ebookId, rating: req.body.rating, comment: req.body.comment})
            .then((comment) => {
                res.statusCode = 200;
                res.json(comment);
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
                    comment.save((err, comment) => {
                        if(err) {
                            next(err);
                        } else {
                            res.statusCode = 200
                            res.json(comment);
                        }
                    })
                } else {
                    res.statusCode = 403
                    res.json({message: 'You are not the owner of the comment'});
                }
            },(err) => next(err))
    })
    .delete(authenticate.loggedIn, (req, res, next) => {
        Comments.findById(req.body.commentId)
            .then((comment) => {
                if (comment.user.equals(req.user._id)) {
                    comment.remove((err, comment) => {
                        if (err) {
                            next(err);
                        } else {
                            res.statusCode = 200
                            res.json(comment);
                        }
                    })
                } else {
                    res.statusCode = 403
                    res.json({message: 'You are not the owner of the comment'});
                }
            },(err) => next(err))
    })

/* DELETE admin force delete - STABLE */
router.delete('/admin', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
    Comments.findByIdAndRemove(req.body.commentId)
        .then((resp) => {
            res.statusCode = 200;
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
})


module.exports = router;
