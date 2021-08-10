const passport = require('passport')
const User = require('./models/users')

const JwtStrategy = require('passport-jwt').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const jwt = require('jsonwebtoken')

// Local strategy

passport.use(User.createStrategy())
exports.logInLocal = passport.authenticate('local')

// Facebook strategy

passport.use(new FacebookStrategy({
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: '/api/login/facebook/callback',
  profileFields: ['id', 'name', 'emails']
},
function (accessToken, refreshToken, profile, cb) {
  console.log(profile)
  User.findOne({ FbOAuth: profile._json.id }, (err, user) => {
    if (err) {
      return cb(err, false)
    }
    if (!err && user !== null) {
      return cb(null, user)
    } else {
      User.create({
        FbOAuth: profile._json.id,
        email: profile._json.email,
        firstname: profile._json.first_name,
        lastname: profile._json.last_name
      }, (err, user) => {
        return cb(err, user)
      })
    }
  })
}
))
exports.logInFB = passport.authenticate('facebook', { scope: ['email'] })

// JWT strategy, give user token once they pass one of the above strategies

const cookieExtractor = function (req) {
  let token = null
  if (req && req.cookies) token = req.cookies.jwt
  return token
}

const opts = {}
opts.jwtFromRequest = cookieExtractor
opts.secretOrKey = process.env.SECRET_KEY

passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
  User.findOne({ _id: jwtPayload._id }, (err, user) => {
    if (err) {
      return done(err, false)
    } else if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }
  })
}))

exports.getToken = (user) => {
  return jwt.sign(user, process.env.SECRET_KEY, { expiresIn: '24h' })
}

exports.loggedIn = passport.authenticate('jwt', { session: false })

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Check admin privilege

exports.isAdmin = (req, res, next) => {
  if (req.user.admin) {
    next()
  } else {
    res.statusCode = 403
    res.end('You are not authorized to perform this operation!')
  }
}
