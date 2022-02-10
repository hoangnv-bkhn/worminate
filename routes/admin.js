const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const {
    getUsers,
    postCategory,
    putCategory,
    blockUser,
    deletePost,
    getStatistic
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

//GET api/admin
router.get('/', asyncErrorHandler(getStatistic));

//GET api/admin/users
router.get('/users', asyncErrorHandler(searchAndFilterUsers), asyncErrorHandler(getUsers));

//PUT api/admin/users
router.put('/users', asyncErrorHandler(blockUser))

//GET api/admin/posts
router.get('/posts', asyncErrorHandler(searchAndFilterPosts), asyncErrorHandler(postIndex));

//DELETE api/admin/posts
router.delete('/posts', asyncErrorHandler(deletePost));

//POST api/admin/categories
router.post('/categories', body('name').isAlphanumeric('vi-VN', { ignore: ' ' }), asyncErrorHandler(postCategory));

//PUT api/admin/categories/{categoryId}
router.put('/categories/:id', param('id').isAlphanumeric().isLength({ min: 24, max: 24 }), asyncErrorHandler(putCategory));

module.exports = router;