var express = require('express');
var router = express.Router();
var Orders = require('../models/orders');
var Ebooks = require('../models/ebooks');
var Users = require('../models/users');
var authenticate = require('../authenticate');

/*
GET to get user's orders
POST to create a new order
*/
router.route('/')
    .get(authenticate.loggedIn, (req, res, next) => {
        Orders.find({user: req.user._id})
            .populate('ebooks', ['name', 'author', 'image', 'price'])
            .then((orders) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(orders);
            }, (err) => next(err))
    })
    .post(authenticate.loggedIn, (req, res, next) => {
        /* UPDATE that user own the books */
        Users.findById(req.user._id)
            .then((user) => {
                user.ownedEBooks.push({$each: req.body.ebookIds})
                user.save((err, user) => {
                    if(err) {
                        next(err)
                    } else {
                        next()
                    }
                })
            }, (err) => next(err))
    }, (req, res, next) => {
        /* UPDATE the book sold amount */
        Ebooks.updateMany({ _id: {$in: req.body.ebookIds}}, { inc: {sold: 1}})
            .then(() => next(), (err) => next(err))
    }, (req, res, next) => {
        /* Create ORDER object */
        Ebooks.aggregate([{
            $match: {_id: {$in: req.body.ebookIds}}
        }, {
            $group: {
                _id: null,
                amount: {
                    $sum: "$price"
                }
            }
        }, {
            $project: {
                _id: 0,
                amount: 1
            }
        }
        ], (respond) => {
            return respond.amount
        })
            .then((amount) => {
                Orders.create({
                    user: req.user._id,
                    ebooks: req.body.ebookIds,
                    payment: req.body.payment,
                    amount: amount
                })
                    .then((order) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(order);
                    }, (err) => next(err))
            })
    })

/* GET all orders */
router.get('/admin', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
    Orders.find({})
        .populate('user', ['email', 'firstname', 'lastname'])
        .then((orders) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(orders);
        }, (err) => next(err))
})

/* GET sale figures include month-year, sum revenue, and the array of ebooks*/
router.get('/report', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {

})
module.exports = router;
