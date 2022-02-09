const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// const { storage } = require('../cloudinary');
// const multer = require('multer');
// const upload = multer({ storage: storage });

const {
    postRegister,
    getProfile,
    showProfileByGuest,
    updateProfile,
    postFollowers,
    deleteFollowers,
    postReport
} = require('../controllers');

const {
    asyncErrorHandler,
    isValidPassword
} = require('../middlewares');

const {
    verifyUser,
    errorHandler
} = require('../middlewares/authenticate');

/* GET PUT DELETE request */
// router.get('*', verifyUser, errorHandler);
router.put('*', verifyUser, errorHandler);
router.delete('*', verifyUser, errorHandler);

//GET /api/user
router.get('/', verifyUser, errorHandler, asyncErrorHandler(getProfile));

//POST /api/user
router.post('/', body('password').isLength({ min: 6, max: 24 }), body('email').isEmail(), asyncErrorHandler(postRegister));

//POST /api/user/followers
router.post('/followers', verifyUser, errorHandler, asyncErrorHandler(postFollowers));

//DELETE /api/user/followers
router.delete('/followers', asyncErrorHandler(deleteFollowers));

//GET /api/user/{userId}
router.get('/:id', param('id').isAlphanumeric().isLength({ min: 24, max: 24 }), asyncErrorHandler(showProfileByGuest));

//PUT /api/user/{userId}
router.put('/:id', asyncErrorHandler(isValidPassword), asyncErrorHandler(updateProfile));

//POST /api/user/report
router.post('/report', verifyUser, errorHandler, asyncErrorHandler(postReport));

module.exports = router;