const passport = require('passport')
const User = require('./models/users')

const JwtStrategy = require('passport-jwt').Strategy
const FacebookTokenStrategy = require('passport-facebook-token')
const GoogleTokenStrategy = require('passport-google-token').Strategy
const jwt = require('jsonwebtoken')

// Local strategy

passport.use(User.createStrategy())
exports.logInLocal = (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(401).send({ success: false, message: 'Log In failed' })
    }
    req.login(user, function (err) {
      if (err) {
        return next(err)
      }
      return next()
    })
  })(req, res, next)
}

// Facebook strategy

passport.use(new FacebookTokenStrategy({
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET
},
function (accessToken, refreshToken, profile, done) {
  User.findOne({ FbOAuth: profile.id }, (err, user) => {
    if (err) {
      return done(err, false)
    }
    if (!err && user !== null) {
      return done(null, user)
    } else {
      User.create({
        FbOAuth: profile.id,
        email: profile.emails[0].value,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName
      }, (err, user) => {
        return done(err, user)
      })
    }
  })
}
))

exports.logInFB = passport.authenticate('facebook-token')

// Google strategy

passport.use(new GoogleTokenStrategy({
  clientID: process.env.GOOG_CLIENT_ID,
  clientSecret: process.env.GOOG_CLIENT_SECRET
},
function (accessToken, refreshToken, profile, done) {
  User.findOne({ GoogleOAuth: profile.id }, (err, user) => {
    if (err) {
      return done(err, false)
    }
    if (!err && user !== null) {
      return done(null, user)
    } else {
      User.create({
        GoogleOAuth: profile.id,
        email: profile.emails[0].value,
        firstname: profile.name.givenName,
        lastname: profile.name.familyName
      }, (err, user) => {
        return done(err, user)
      })
    }
  })
}
))

exports.logInGOOG = passport.authenticate('google-token')

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

exports.loggedIn = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return res.status(401).send({ success: false, message: 'You need to be logged in to continue' })
    }
    req.login(user, function (err) {
      if (err) {
        return next(err)
      }
      return next()
    })
  })(req, res, next)
}

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
