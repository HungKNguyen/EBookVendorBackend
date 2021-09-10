const express = require('express')
const router = express.Router()
const Orders = require('../models/orders')
const Ebooks = require('../models/ebooks')
const Users = require('../models/users')
const authenticate = require('../authenticate')
const mongoose = require('mongoose')
const moment = require('moment')

/*
GET to get user's orders - STABLE
POST to create a new order - STABLE
*/
router.route('/')
  .get(authenticate.loggedIn, (req, res, next) => {
    Orders.find({ user: req.user._id })
      .populate('ebooks', ['name', 'author', 'image', 'price'])
      .then((orders) => {
        res.statusCode = 200
        res.json(orders)
      }, (err) => next(err))
  })
  .post(authenticate.loggedIn, (req, res, next) => {
    const ids = req.body.ebookIds.map((id) => mongoose.Types.ObjectId(id))
    Ebooks.aggregate([
      { $match: { _id: { $in: ids } } },
      {
        $group: {
          _id: null,
          amount: { $sum: '$price' }
        }
      },
      {
        $project: {
          _id: 0,
          amount: 1
        }
      }
    ])
      .then((response) => {
        const today = new Date()
        return Orders.create({
          user: req.user._id,
          ebooks: req.body.ebookIds,
          amount: response[0].amount,
          month: today.getMonth() + 1,
          year: today.getFullYear()
        })
      })
      .then(() => {
        return Ebooks.updateMany({ _id: { $in: req.body.ebookIds } }, { $inc: { sold: 1 } })
      })
      .then(() => {
        return Users.findById(req.user._id)
      })
      .then((user) => {
        user.ownedEBooks.push({ $each: req.body.ebookIds })
        user.save((err, user) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully placed your order' })
          }
        })
      })
      .catch((err) => next(err))
  })

router.get('/admin', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
  Orders.find({})
    .sort({ createdAt: -1 })
    .skip(req.body.skip)
    .limit(10)
    .populate('user', ['email', 'firstname', 'lastname'])
    .populate('ebooks', 'name')
    .then((orders) => {
      res.statusCode = 200
      res.json(orders)
    }, (err) => next(err))
})

/* GET 3 recent order - STABLE */
router.get('/admin/recent', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
  Orders.find({})
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('user', ['email', 'firstname', 'lastname'])
    .populate('ebooks', 'name')
    .then((orders) => {
      res.statusCode = 200
      res.json(orders)
    }, (err) => next(err))
})

router.get('/admin/summary', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
  const startDate = moment().subtract(3, 'months').startOf('month').toISOString()
  const endDate = moment().endOf('month').toISOString()
  Orders.aggregate([
    { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
    { $group: { _id: { month: { $month: '$createAt' }, year: { $year: '$createAt' } }, revenue: { $sum: '$amount' }, count: { $sum: { $size: '$ebooks' } } } }
  ])
    .then((report) => {
      res.statusCode = 200
      res.json(report)
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
        res.locals.date = new Date(req.body.year, req.body.month, 1).toLocaleString('default', { year: 'numeric', month: 'short' })
        res.locals.ebooksCount = report
        res.statusCode = 200
        res.json(res.locals)
      }, (err) => next(err))
  }
)
module.exports = router
