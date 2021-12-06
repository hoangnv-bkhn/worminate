const express = require('express');
const router = express.Router();

const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

const {
    getLogout,
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

/* ALL request */
router.all('*', verifyUser, errorHandler);

//GET /user/logout/:token
// res.json({ message, success })
router.get('/logout/:token', asyncErrorHandler(getLogout));

//GET /user/profile
// res.json({ data: posts, message, success })
router.get('/profile');

//PUT /user/profile | body(fullName: String, image: file, password: String, newPassword: String)
// res.json({ data: user, message, success })
router.put('/profile', upload.single('image'), asyncErrorHandler(isValidPassword), asyncErrorHandler(updateProfile));

module.exports = router;