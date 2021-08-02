var express = require('express');
var router = express.Router();
var authenticate = require('../authenticate');
var User = require('../models/users');

router.get('/public', (req, res, next) => {
    res.statusCode = 200;
    res.json({success: true, status: 'Public resources'});
})

router.get('/secret', authenticate.loggedIn, function(req, res){
    res.statusCode = 200;
    res.json({success: true, status: 'Hidden to non-user'});
});

router.get('/supersecret', authenticate.loggedIn, authenticate.isAdmin, function(req, res){
    res.statusCode = 200;
    res.json({success: true, status: 'Only for an admin'});
});

router.post('/login', authenticate.logInLocal,
    function(req, res) {
        let token = authenticate.getToken({_id: req.user._id});
        res.statusCode = 200;
        res.cookie('jwt', token, {httpOnly: true, maxAge: 24 * 3600 * 1000})
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'You are successfully logged in!'});
    }
);

router.get('/logout', function(req, res){
    req.logout();
    res.statusCode = 200;
    res.clearCookie('jwt', {path: '/'})
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, status: 'You are successfully logged out!'});
});

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
                    let token = authenticate.getToken({_id: req.user._id});
                    res.statusCode = 200;
                    res.cookie('jwt', token, {httpOnly: true, maxAge: 24 * 3600 * 1000})
                    res.setHeader('Content-Type', 'application/json');
                    res.json({success: true, status: 'Registration Successful!'});
                });
            });
        }
    });
});

module.exports = router;
