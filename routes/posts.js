const express = require('express');
const router = express.Router();

// const { storage } = require('../cloudinary');
// const multer = require('multer');
// const upload = multer({ storage: storage });

const {
    postIndex,
    getCategory,
    postCreate,
    postShow,
    postUpdate,
    postDestroy,
    postFavorite
} = require('../controllers/posts');

const {
    asyncErrorHandler,
    isAuthor,
    searchAndFilterPosts
} = require('../middlewares');

const {
    verifyUser,
    errorHandler
} = require('../middlewares/authenticate');

const {
    validateParams
} = require('../middlewares/reqValidate');

/* POST, PUT, DELETE request */
router.post('*', verifyUser, errorHandler);
router.put('*', verifyUser, errorHandler);
router.delete('*', verifyUser, errorHandler);

//GET /api/posts
router.get('/', asyncErrorHandler(searchAndFilterPosts), asyncErrorHandler(postIndex));

//GET /api/posts/new
router.get('/new', asyncErrorHandler(getCategory));

//POST /api/posts
router.post('/', asyncErrorHandler(postCreate));

//GET /api/posts/{postId}
router.get('/:id', validateParams, asyncErrorHandler(postShow));

//PUT /api/posts/{postId}
router.put('/:id', validateParams, asyncErrorHandler(isAuthor), asyncErrorHandler(postUpdate));

//DELETE /api/posts/{postId}
router.delete('/:id', validateParams, asyncErrorHandler(isAuthor), asyncErrorHandler(postDestroy));

//GET /api/posts/{postId}/favorite
router.get('/:id/favorite', verifyUser, errorHandler, validateParams, asyncErrorHandler(postFavorite));

module.exports = router;