var express = require('express');
var router = express.Router();
var User = require('../models/users');
var authenticate = require('../authenticate');

/* GET users listing. */
router.get('/', authenticate.loggedIn, authenticate.isAdmin, function(req, res, next) {
  User.find({})
      .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
      }, (err) => next(err))
      .catch((err) => next(err));
})

router.route('/profile')
    .get(authenticate.loggedIn, function(req, res, next) {
        User.findById(req.user._id)
            .then((user) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user);
            }, (err) => next(err))
    })
    .delete(authenticate.loggedIn, (req, res, next) => {
        User.findByIdAndRemove(req.user._id)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = router;
