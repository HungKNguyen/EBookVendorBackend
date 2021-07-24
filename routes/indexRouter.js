var express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');
var User = require('../models/users');

/* GET request for normal authorization - STABLE*/
router.get('/secret', authenticate.loggedIn, function(req, res){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'Hidden to non-user'});
});

/* GET request for admin authorization - STABLE*/
router.get('/supersecret', authenticate.loggedIn, authenticate.isAdmin, function(req, res){
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'Only for an admin'});
});

/* POST request to login - STABLE*/
router.post('/login', authenticate.logInLocal,
    function(req, res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'You are successfully logged in!'});
    }
);

/* GET request to logout - STABLE*/
router.get('/logout', function(req, res){
    req.logout();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'You are successfully logged out!'});
});

/* POST request to signup - STABLE*/
router.post('/signup',function(req,res,next) {
    User.register(new User({email: req.body.email}), req.body.password, (err, user) => {
        if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
        }
        else {
            if (req.body.firstname) {
                user.firstname = req.body.firstname;
            }
            if (req.body.lastname) {
                user.lastname = req.body.lastname;
            }
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({err: err});
                    return ;
                }
                authenticate.logInLocal(req, res, () => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                });
            });
        }
    });
});

module.exports = router;
