const express = require('express')
const router = express.Router()
const Orders = require('../models/orders')
const Ebooks = require('../models/ebooks')
const Users = require('../models/users')
const authenticate = require('../authenticate')
const mongoose = require('mongoose')

/*
GET to get user's orders - STABLE
POST to create a new order - OKAY
*/
router.route('/')
  .get(authenticate.loggedIn, (req, res, next) => {
    Orders.find({ user: req.user._id })
      .populate('ebooks', ['name', 'author', 'image', 'price'])
      .then((orders) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(orders)
      }, (err) => next(err))
  })
  .post(authenticate.loggedIn, (req, res, next) => {
    /* Create ORDER object */
    const ids = req.body.ebookIds.map((id) => mongoose.Types.ObjectId(id))
    Ebooks.aggregate([
      { $match: { _id: { $in: ids } } },
      { $group: { _id: null, amount: { $sum: '$price' } } },
      { $project: { _id: 0, amount: 1 } }
    ])
      .then((respond) => {
        const today = new Date()
        Orders.create({
          user: req.user._id,
          ebooks: req.body.ebookIds,
          payment: req.body.payment,
          amount: respond[0].amount,
          month: today.getMonth() + 1,
          year: today.getFullYear()
        })
          .then((order) => {
            res.locals.order = order
            next()
          }, (err) => next(err))
      })
  }, (req, res, next) => {
    /* UPDATE the book sold amount - STABLE */
    Ebooks.updateMany({ _id: { $in: req.body.ebookIds } }, { $inc: { sold: 1 } })
      .then(() => next(), (err) => next(err))
  }, (req, res, next) => {
    /* UPDATE that user own the books - TODO: CHECK FOR DUPLICATES WHEN WORKING FOR REAL */
    Users.findById(req.user._id)
      .then((user) => {
        user.ownedEBooks.push({ $each: req.body.ebookIds })
        user.save((err, user) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(res.locals.order)
          }
        })
      }, (err) => next(err))
  }
  )

/* GET all orders - STABLE */
router.get('/admin', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
  Orders.find({})
    .populate('user', ['email', 'firstname', 'lastname'])
    .populate('ebooks', 'name')
    .then((orders) => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.json(orders)
    }, (err) => next(err))
})

/* GET sale figures include month-year, sum revenue, and the array of ebooks - STABLE */
router.get('/report', authenticate.loggedIn, authenticate.isAdmin,
  (req, res, next) => {
    // Get total revenue
    Orders.aggregate([
      { $match: { month: req.body.month, year: req.body.year } },
      { $group: { _id: null, revenue: { $sum: '$amount' }, totalCount: { $sum: { $size: '$ebooks' } } } }
    ])
      .then((report) => {
        res.locals.revenue = report[0].revenue
        res.locals.totalCount = report[0].totalCount
        next()
      }, (err) => next(err))
  }, (req, res, next) => {
    // Get book count
    Orders.aggregate([
      { $match: { month: req.body.month, year: req.body.year } },
      { $unwind: '$ebooks' },
      { $group: { _id: '$ebooks', count: { $sum: 1 } } },
      { $project: { ebook: { $toObjectId: '$_id' }, count: 1, _id: 0 } },
      {
        $lookup: {
          from: 'ebooks',
          localField: 'ebook',
          foreignField: '_id',
          as: 'ebook'
        }
      }
    ])
      .then((report) => {
        res.locals.month = req.body.month
        res.locals.year = req.body.year
        res.locals.ebooksCount = report
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(res.locals)
      }, (err) => next(err))
  }
)
module.exports = router
