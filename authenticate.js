var passport = require('passport')
var User = require('./models/users');

var JwtStrategy = require('passport-jwt').Strategy;
var jwt = require('jsonwebtoken');
var config = require('./config.js');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.logInLocal = passport.authenticate('local');

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) token = req.cookies['jwt'];
    return token;
};

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, {expiresIn: '24h'})
}

var opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = config.secretKey;

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.loggedIn = passport.authenticate('jwt', {session: false});

exports.isAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    } else {
        res.statusCode = 403;
        res.end('You are not authorized to perform this operation!');
    }
}
