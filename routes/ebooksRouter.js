const express = require('express')
const router = express.Router()
const EBooks = require('../models/ebooks')
const authenticate = require('../authenticate')

/*
GET to get all ebooks that are paged - STABLE
PUT to modify an ebook - STABLE
POST to create a new ebook - STABLE
DELETE to delete an ebook - STABLE
 */
router.route('/')
  .get((req, res, next) => {
    EBooks.find({})
      .sort({ [req.body.sort]: req.body.order })
      .skip(req.body.skip)
      .limit(10)
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
      ISBN: req.body.ISBN,
      featured: req.body.featured
    })
      .then(() => {
        res.statusCode = 200
        res.json({ message: 'You have successfully posted an ebook' })
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
        if (req.body.featured) {
          ebook.featured = req.body.featured
        }
        ebook.save((err) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully modified the ebook' })
          }
        })
      }, (err) => next(err))
  })
  .delete(authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
    EBooks.findByIdAndRemove(req.body.ebookId)
      .then(() => {
        res.statusCode = 200
        res.json({ message: 'You have successfully deleted the ebook' })
      }, (err) => next(err))
  })

router.get('/single/:ebookId', (req, res, next) => {
  EBooks.findById(req.params.ebookId)
    .then((ebook) => {
      res.statusCode = 200
      res.json(ebook)
    }, (err) => next(err))
})

router.get('/featured', (req, res, next) => {
  EBooks.find({ featured: true })
    .then((ebooks) => {
      res.statusCode = 200
      res.json(ebooks)
    }, (err) => next(err))
})

router.get('/search', (req, res, next) => {
  EBooks.find({ $text: { $search: req.body.search } })
    .skip(req.body.skip)
    .limit(10)
    .then((ebooks) => {
      res.statusCode = 200
      res.json(ebooks)
    }, (err) => next(err))
})

router.get('/bestseller', authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
  EBooks.aggregate([
    { $sort: { sold: -1 } },
    { $limit: 3 }
  ])
    .then((ebooks) => {
      res.statusCode = 200
      res.json(ebooks)
    }, (err) => next(err))
})

module.exports = router
