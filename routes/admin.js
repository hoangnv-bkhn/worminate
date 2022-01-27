const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const {
    getUsers,
    postCategory,
    putCategory,
    blockUser,
    deletePost
} = require('../controllers/admin');

const {
    postIndex
} = require('../controllers/posts');

const {
    asyncErrorHandler,
    isAdmin,
    searchAndFilterPosts,
    searchAndFilterUsers
} = require('../middlewares');

const {
    verifyUser,
    errorHandler
} = require('../middlewares/authenticate');

router.all('*', verifyUser, errorHandler, isAdmin);

//GET /admin/users
router.get('/users', asyncErrorHandler(searchAndFilterUsers), asyncErrorHandler(getUsers));

//PUT /admin/users
router.put('/users', asyncErrorHandler(blockUser))

//GET /admin/posts
router.get('/posts', asyncErrorHandler(searchAndFilterPosts), asyncErrorHandler(postIndex));

//DELETE /admin/posts
router.delete('/posts', asyncErrorHandler(deletePost));

//POST /admin/categories
router.post('/categories', body('name').isAlphanumeric('vi-VN', { ignore: ' ' }), asyncErrorHandler(postCategory));

//PUT /admin/categories/{categoryId}
router.put('/categories/:id', param('id').isAlphanumeric().isLength({ min: 24, max: 24 }), asyncErrorHandler(putCategory));

module.exports = router;