const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// const { storage } = require('../cloudinary');
// const multer = require('multer');
// const upload = multer({ storage: storage });

const {
    postIndex,
    getCategory,
    postCreate,
    postShow,
    postSale,
    postUpdate,
    postDestroy,
    postFavorite,
    deleteFavorite,
    promotionalPlan
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

//POST /api/posts/favorite
router.post('/favorite', asyncErrorHandler(postFavorite));

//DELETE /api/posts/favorite
router.delete('/favorite', asyncErrorHandler(deleteFavorite));

//GET /api/posts/{postId}
router.get('/:id', param('id').isAlphanumeric().isLength({ min: 24, max: 24 }), asyncErrorHandler(postShow));

//PUT /api/posts/{postId}
router.put('/:id', asyncErrorHandler(isAuthor), asyncErrorHandler(postUpdate));

//DELETE /api/posts/{postId}
router.delete('/:id', asyncErrorHandler(isAuthor), asyncErrorHandler(postDestroy));

//POST /api/posts/{postId}/sale
router.post('/:id/sale', asyncErrorHandler(isAuthor), asyncErrorHandler(postSale));

//POST /api/posts/{postId}/promotion
router.post('/:id/promotion', asyncErrorHandler(isAuthor), asyncErrorHandler(promotionalPlan));

module.exports = router;