var passport = require('passport')
var User = require('./models/users');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.logInLocal = passport.authenticate('local');

exports.loggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.statusCode = 401;
        res.end('You are not logged in.');
    }
}

exports.isAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
        let err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        next(err);
    }
}
