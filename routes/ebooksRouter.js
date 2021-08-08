const express = require('express')
const router = express.Router()
const EBooks = require('../models/ebooks')
const authenticate = require('../authenticate')

/*
GET to get all ebooks - STABLE
PUSH to modify an ebook - STABLE
POST to create a new ebook - STABLE
DELETE to delete an ebook - STABLE
 */
router.route('/')
  .get((req, res, next) => {
    EBooks.find({})
      .then((ebooks) => {
        res.statusCode = 200
        res.json(ebooks)
      }, (err) => next(err))
  })
  .post(authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
    EBooks.create({
      name: req.body.name,
      author: req.body.author,
      price: req.body.price,
      description: req.body.description,
      ISBN: req.body.ISBN
    })
      .then((ebook) => {
        res.statusCode = 200
        res.json(ebook)
      }, (err) => next(err))
  })
  .put(authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
    EBooks.findById(req.body.ebookId)
      .then((ebook) => {
        if (req.body.name) {
          ebook.name = req.body.name
        }
        if (req.body.author) {
          ebook.author = req.body.author
        }
        if (req.body.price) {
          ebook.price = req.body.price
        }
        if (req.body.description) {
          ebook.description = req.body.description
        }
        if (req.body.ISBN) {
          ebook.ISBN = req.body.ISBN
        }
        ebook.save((err, ebook) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json(ebook)
          }
        })
      }, (err) => next(err))
  })
  .delete(authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
    EBooks.findByIdAndRemove(req.body.ebookId)
      .then((resp) => {
        res.statusCode = 200
        res.json(resp)
      }, (err) => next(err))
  })

router.get('/single/:ebookId', (req, res, next) => {
  EBooks.findById(req.params.ebookId)
    .then((ebook) => {
      res.statusCode = 200
      res.json(ebook)
    }, (err) => next(err))
})

router.get('/favorite', (req, res, next) => {
  EBooks.aggregate([
    { $sort: { liked: -1 } },
    { $limit: 3 }
  ])
    .then((ebooks) => {
      res.statusCode = 200
      res.json(ebooks)
    }, (err) => next(err))
})

module.exports = router
