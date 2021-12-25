const express = require('express');
const router = express.Router();

const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

const {
    postRegister,
    getProfile,
    updateProfile
} = require('../controllers');

const {
    asyncErrorHandler,
    isValidPassword
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
router.get('/');

//POST /api/user
router.post('/', upload.single('image'), validateBody, asyncErrorHandler(postRegister));

//GET /api/user/{userId}
router.get('/:id', validateParams, asyncErrorHandler(getProfile));

//PUT /api/user/{userId}
router.put('/:id', validateParams, upload.single('image'), validateBody, asyncErrorHandler(isValidPassword), asyncErrorHandler(updateProfile));

//DELETE /api/user/{userId}
router.delete('/:id', validateParams);

module.exports = router;