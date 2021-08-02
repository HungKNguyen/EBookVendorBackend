var express = require('express');
var router = express.Router();
var Users = require('../models/users');
var authenticate = require('../authenticate');

/* GET all users - STABLE */
router.get('/', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
    Users.find({})
        .then((users) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        }, (err) => next(err))
})

/* GET/MODIFY/DELETE own account - STABLE */
router.route('/profile')
    /* GET user account - STABLE*/
    .get(authenticate.loggedIn, function(req, res, next) {
        Users.findById(req.user._id)
            .then((user) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user);
            }, (err) => next(err))
    })
    /* DELETE user account - STABLE*/
    .delete(authenticate.loggedIn, (req, res, next) => {
        Users.findByIdAndRemove(req.user._id)
            .then((resp) => {
                req.logout();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    /* PUT user account - STABLE*/
    .put(authenticate.loggedIn, (req, res, next) => {
        Users.findById(req.user._id)
            .then((user) => {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                if (req.body.email) {
                    user.email = req.body.email;
                }
                user.save((err, user) => {
                    if(err) {
                        next(err)
                    } else {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json');
                        res.json(user);
                    }
                })
            }, (err) => next(err))
    });

/* PUT to change password - STABLE*/
router.put('/password', authenticate.loggedIn, (req, res, next) => {
        Users.findById(req.user._id)
            .then((user) => {
                user.changePassword(req.body.oldPassword, req.body.newPassword, function (err) {
                    if(err) {
                        next(err);
                    } else {
                        res.statusCode = 200
                        res.json({ success: true, message: 'Your password has been changed successfully' });
                    }
                })
            })
    })

/*
POST to add favorite ebook - STABLE
DELETE to delete a favorite ebook - STABLE
*/
router.route('/favorite')
    .post(authenticate.loggedIn, (req, res, next) => {
        Users.findById(req.user._id)
            .then((user) => {
                if (user.favEBooks.indexOf(req.body.ebookId) === -1) {
                    user.favEBooks.push(req.body.ebookId);
                }
                user.save((err, user) => {
                    if(err) {
                        next(err)
                    } else {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json');
                        res.json(user);
                    }
                })
            }, (err) => next(err))
    })
    .delete(authenticate.loggedIn, (req, res, next) => {
        Users.findById(req.user._id)
            .then((user) => {
                user.favEBooks.pull(req.body.ebookId)
                user.save((err, user) => {
                    if(err) {
                        next(err)
                    } else {
                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json');
                        res.json(user);
                    }
                })
            }, (err) => next(err))
    })

module.exports = router;
