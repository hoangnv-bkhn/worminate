const express = require('express');
const router = express.Router();

const {
    postCategory,
    putCategory
} = require('../controllers/admin');

const {
    asyncErrorHandler,
    isAdmin
} = require('../middlewares');

const {
    verifyUser,
    errorHandler
} = require('../middlewares/authenticate');

router.all('*', verifyUser, errorHandler, isAdmin);

//POST /admin/categories
router.post('/categories', asyncErrorHandler(postCategory));

//PUT /admin/categories/{categoryId}
router.put('/admin/categories/:id', asyncErrorHandler(putCategory));

module.exports = router;