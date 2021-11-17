const express = require('express');
const router = express.Router({ mergeParams: true });
const { asyncErrorHandler, isLoggedIn, isReviewAuthor } = require('../middleware');
const {
    reviewCreate,
    reviewUpdate,
    reviewDestroy
} = require('../controllers/reviews')

/* POST reviews create /posts/:id/reviews. */
router.post('/', isLoggedIn(), asyncErrorHandler(reviewCreate));

/* PUT reviews update /posts/:id/reviews/:review_id. */
router.put('/:review_id', isLoggedIn(), isReviewAuthor, asyncErrorHandler(reviewUpdate));

/* DELETE reviews delete /posts/:id/reviews/:review_id. */
router.delete('/:review_id', isLoggedIn(), isReviewAuthor, asyncErrorHandler(reviewDestroy));

module.exports = router;
