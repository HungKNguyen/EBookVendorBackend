var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser")
var logger = require('morgan');
// var session = require('express-session');
var passport = require('passport');


var indexRouter = require('./routes/indexRouter');
var usersRouter = require('./routes/usersRouter');
var commentsRouter = require('./routes/commentsRouter');
var ordersRouter = require('./routes/ordersRouter');
var reviewsRouter = require('./routes/reviewsRouter');
var ebooksRouter = require('./routes/ebooksRouter');
var uploadRouter = require('./routes/uploadRouter');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(session({
//   secret: 'ebook is the future',
//   resave: false,
//   saveUninitialized: true
// }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/ebooks', ebooksRouter);
app.use('/api/upload', uploadRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.statusCode = 404;
  res.end("This is an error")
});


module.exports = app;
