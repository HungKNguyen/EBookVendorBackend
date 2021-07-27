const express = require('express');
const fs = require('fs');
const path = require('path')
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const EBooks = require('../models/ebooks');
const Users = require('../models/users');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();
uploadRouter.use(bodyParser.json());

/* POST to upload/overwrite an image to an ebook - STABLE*/
uploadRouter.post('/imgEbook/:ebookId', authenticate.loggedIn, authenticate.isAdmin, upload.single('imageFile'), (req, res, next) => {
    EBooks.findById(req.params.ebookId)
        .then((ebook) => {
            if (ebook.image){
                fs.unlinkSync(ebook.image);
            }
            ebook.image = req.file.path
            ebook.save((err, ebook) => {
                if(err) {
                    next(err)
                } else {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json');
                    res.json(ebook);
                }
            })
        })
});

/* POST to upload/overwrite an image to an account - STABLE */
uploadRouter.post('/imgUser', authenticate.loggedIn, upload.single('imageFile'), (req, res, next) => {
    Users.findById(req.user._id)
        .then((user) => {
            if (user.image){
                fs.unlinkSync(user.image);
            }
            user.image = req.file.path
            user.save((err, user) => {
                if(err) {
                    next(err)
                } else {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user);

                }
            })
        })
});

module.exports = uploadRouter;