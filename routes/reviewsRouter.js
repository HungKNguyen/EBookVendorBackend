var express = require('express');
var router = express.Router();
var Reviews = require('../models/reviews');
var authenticate = require('../authenticate');


/*
GET to get all reviews -STABLE
POST to post new review -STABLE
PUT to modify user review -STABLE
DELETE to delete user review -STABLE
 */
router.route('/')
    .get((req, res, next) => {
        Reviews.find({})
            .populate('user', ['firstname', 'lastname', 'image'])
            .then((reviews) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(reviews);
            }, (err) => next(err))
    })
    .post(authenticate.loggedIn, (req, res, next) => {
        Reviews.create({user: req.user._id, rating: req.body.rating, review: req.body.review})
            .then((review) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(review);
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
                    review.save((err, review) => {
                        if(err) {
                            next(err);
                        } else {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json');
                            res.json(review);
                        }
                    })
                } else {
                    res.statusCode = 403
                    res.setHeader('Content-Type', 'application/json');
                    res.json({message: 'You are not the owner of the review'});
                }
            },(err) => next(err))
    })
    .delete(authenticate.loggedIn, (req, res, next) => {
        Reviews.findById(req.body.reviewId)
            .then((review) => {
                if (review.user.equals(req.user._id)) {
                    review.remove((err, review) => {
                        if (err) {
                            next(err);
                        } else {
                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json');
                            res.json(review);
                        }
                    })
                } else {
                    res.statusCode = 403
                    res.setHeader('Content-Type', 'application/json');
                    res.json({message: 'You are not the owner of the review'});
                }
            },(err) => next(err))
    })

module.exports = router;