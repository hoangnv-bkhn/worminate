const express = require('express');
const router = express.Router();
const {
    manageAdmin,
    addCategory,
    userIndex,
    deletePostbyId,
} = require('../controllers/admin');
const {
    asyncErrorHandler,
    SearchFilterUser,
    isAdmin
} = require('../middleware');

/* GET /admin*/
router.get('/', isAdmin, manageAdmin);

/* GET /admin/users?category=*/
router.get('/users', isAdmin, asyncErrorHandler(SearchFilterUser), asyncErrorHandler(userIndex));

/* POST /admin/add Category */
router.post('/add', isAdmin, addCategory);

/* DELETE /admin/posts/:id*/
router.delete('/posts/:id', isAdmin, deletePostbyId);

module.exports = router;