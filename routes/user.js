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

/* GET PUT DELETE request */
router.get('*', verifyUser, errorHandler);
router.put('*', verifyUser, errorHandler);
router.delete('*', verifyUser, errorHandler);

//GET /api/user
router.get('/');

//POST /api/user
router.post('/', upload.single('image'), asyncErrorHandler(postRegister));

//GET /api/user/{userId}
router.get('/:id', asyncErrorHandler(getProfile));

//PUT /api/user/{userId}
router.put('/:id', upload.single('image'), asyncErrorHandler(isValidPassword), asyncErrorHandler(updateProfile));

//DELETE /api/user/{userId}
router.delete('/:id');

module.exports = router;