const express = require('express');
const router = express.Router({ mergeParams: true });

const {
    reviewCreate,
    reviewUpdate,
    reviewDestroy
} = require('../controllers/reviews');

const {
    asyncErrorHandler,
    isReviewAuthor
} = require('../middlewares');

const {
    verifyUser,
    errorHandler
} = require('../middlewares/authenticate');

//ALL request
router.all('*', verifyUser, errorHandler);

//POST /api/posts/{postId}/reviews
router.post('/', asyncErrorHandler(reviewCreate));

//PUT /api/posts/{postId}/reviews/{review_id}
router.put('/:review_id', asyncErrorHandler(isReviewAuthor), asyncErrorHandler(reviewUpdate));

//DELETE /api/posts/{postId}/reviews/{review_id}
router.delete('/:review_id', asyncErrorHandler(isReviewAuthor), asyncErrorHandler(reviewDestroy));

module.exports = router;