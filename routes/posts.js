const express = require('express');
const router = express.Router();

const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

const {
    postIndex,
    postCreate,
    postShow
} = require('../controllers/posts');

const {
    asyncErrorHandler,
    searchAndFilterPosts
} = require('../middlewares');

const {
    verifyUser,
    errorHandler
} = require('../middlewares/authenticate');

/* POST, PUT, DELETE request */
router.post('*', verifyUser, errorHandler);
router.put('*', verifyUser, errorHandler);
router.delete('*', verifyUser, errorHandler);

//GET /posts
router.get('/', asyncErrorHandler(searchAndFilterPosts), asyncErrorHandler(postIndex));

//POST /posts
router.post('/', upload.array('images', 4), asyncErrorHandler(postCreate));

//GET /posts/:id
router.get('/:id', asyncErrorHandler(postShow));

//PUT /posts/:id
router.put('/:id');

//DELETE /posts/:id
router.delete('/:id');

module.exports = router;