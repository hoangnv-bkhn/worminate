const express = require('express');
const router = express.Router();

const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

const {
    postCreate
} = require('../controllers/posts');

const {
    asyncErrorHandler
} = require('../middlewares');

const {
    verifyUser,
    errorHandler
} = require('../middlewares/authenticate');

/* POST, PUT, DELETE request */
router.post('*', verifyUser, errorHandler);
router.put('*', verifyUser, errorHandler);
router.delete('*', verifyUser, errorHandler);

//GET /posts | params()
// res.json({ data: posts, message, success})
router.get('/');

//POST /posts/new | body()
// res.json({ message, success })
router.post('/new', upload.array('images', 4), asyncErrorHandler(postCreate));

//GET /posts/:id
// res.json({ data: post, message, success})
router.get('/:id');

//PUT /posts/:id | body()
// res.json({ message, success})
router.put('/:id');

//DELETE /posts/:id
// res.json({ message, success })
router.delete('/:id');

module.exports = router;