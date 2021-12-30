const express = require('express');
const router = express.Router();

const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

const {
    postRegister,
    getProfile,
    updateProfile,
    postFollowers,
    deleteFollowers
} = require('../controllers');

const {
    getUsers
} = require('../controllers/admin');

const {
    asyncErrorHandler,
    isValidPassword,
    isAdmin
} = require('../middlewares');

const {
    verifyUser,
    errorHandler
} = require('../middlewares/authenticate');

const {
    validateParams,
    validateBody
} = require('../middlewares/reqValidate');

/* GET PUT DELETE request */
router.get('*', verifyUser, errorHandler);
router.put('*', verifyUser, errorHandler);
router.delete('*', verifyUser, errorHandler);

//GET /api/user
router.get('/', isAdmin, asyncErrorHandler(getUsers));

//POST /api/user
router.post('/', upload.single('image'), validateBody, asyncErrorHandler(postRegister));

//POST /api/user/followers
router.post('/followers', verifyUser, errorHandler, asyncErrorHandler(postFollowers));

//DELETE /api/user/followers
router.delete('/followers', asyncErrorHandler(deleteFollowers));

//GET /api/user/{userId}
router.get('/:id', validateParams, asyncErrorHandler(getProfile));

//PUT /api/user/{userId}
router.put('/:id', validateParams, upload.single('image'), validateBody, asyncErrorHandler(isValidPassword), asyncErrorHandler(updateProfile));

//DELETE /api/user/{userId}
router.delete('/:id', validateParams);

module.exports = router;