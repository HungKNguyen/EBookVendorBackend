require('dotenv').config()
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const logger = require('morgan')
const passport = require('passport')
const cors = require('cors')

const indexRouter = require('./routes/indexRouter')
const usersRouter = require('./routes/usersRouter')
const commentsRouter = require('./routes/commentsRouter')
const ordersRouter = require('./routes/ordersRouter')
const reviewsRouter = require('./routes/reviewsRouter')
const ebooksRouter = require('./routes/ebooksRouter')
const uploadRouter = require('./routes/uploadRouter')

const app = express()

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}))
app.use(logger('dev'))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use(passport.initialize())
app.use(passport.session())

app.use('/api', indexRouter)
app.use('/api/users', usersRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/ebooks', ebooksRouter)
app.use('/api/upload', uploadRouter)

// catch 404
app.use(function (error, req, res, next) {
  if (error) {
    next(error)
  } else {
    res.statusCode = 404
    res.end('Not found')
  }
})

// catch 500
app.use(function (error, res, next) {
  res.status(500).send(error)
})
module.exports = app
