const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const authenticate = require('../authenticate')
const EBooks = require('../models/ebooks')
const Users = require('../models/users')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const imageFileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('You can upload only image files!'), false)
  }
  cb(null, true)
}

const upload = multer({ storage: storage, fileFilter: imageFileFilter })

/* POST to upload/overwrite an image to an ebook - STABLE */
/* DELETE to remove an image to an ebook */
router.route('/imgEbook')
  .post(authenticate.loggedIn, authenticate.isAdmin, upload.single('imageFile'), (req, res, next) => {
    EBooks.findById(req.body.ebookId)
      .then((ebook) => {
        if (ebook.image !== '') {
          if (fs.existsSync(ebook.image)) {
            fs.unlinkSync(ebook.image)
          }
        }
        ebook.image = req.file.path
        ebook.save((err) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully uploaded the ebook image' })
          }
        })
      })
  })
  .delete(authenticate.loggedIn, authenticate.isAdmin, (req, res, next) => {
    EBooks.findById(req.body.ebookId)
      .then((ebook) => {
        if (ebook.image !== '') {
          if (fs.existsSync(ebook.image)) {
            fs.unlinkSync(ebook.image)
          }
          ebook.image = ''
          ebook.save((err) => {
            if (err) {
              next(err)
            } else {
              res.statusCode = 200
              res.json({ message: 'You have successfully removed the ebook image' })
            }
          })
        } else {
          res.statusCode = 200
          res.json({ message: 'The ebook doesn\'t currently have an image' })
        }
      })
  })

/* POST to upload/overwrite an image to an account - STABLE */
/* DELETE to remove an image to an user */
router.route('/imgUser')
  .post(authenticate.loggedIn, upload.single('imageFile'), (req, res, next) => {
    Users.findById(req.user._id)
      .then((user) => {
        if (user.image !== '') {
          if (fs.existsSync(user.image)) {
            fs.unlinkSync(user.image)
          }
        }
        user.image = req.file.path
        user.save((err) => {
          if (err) {
            next(err)
          } else {
            res.statusCode = 200
            res.json({ message: 'You have successfully uploaded the profile image' })
          }
        })
      })
  })
  .delete(authenticate.loggedIn, (req, res, next) => {
    Users.findById(req.user._id)
      .then((user) => {
        if (user.image !== '') {
          if (fs.existsSync(user.image)) {
            fs.unlinkSync(user.image)
          }
          user.image = ''
          user.save((err) => {
            if (err) {
              next(err)
            } else {
              res.statusCode = 200
              res.json({ message: 'You have successfully removed the profile image' })
            }
          })
        } else {
          res.statusCode = 200
          res.json({ message: 'Your profile doesn\'t currently have an image' })
        }
      })
  })

module.exports = router
