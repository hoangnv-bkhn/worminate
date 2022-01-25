const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// const { storage } = require('../cloudinary');
// const multer = require('multer');
// const upload = multer({ storage: storage });

const {
  landingPage,
  postLogin,
  postLogout,
  getActiveAccount,
  postForgotPw,
  putReset
} = require('../controllers');

const {
  asyncErrorHandler
} = require('../middlewares');

const {
  verifyUser,
  errorHandler
} = require('../middlewares/authenticate');

//GET /api
router.get('/', asyncErrorHandler(landingPage));

//POST /api/login
router.post('/login', body('email').isEmail(), body('password').isLength({ min: 3, max: 24 }), asyncErrorHandler(postLogin));

//POST /api/logout
router.post('/logout', verifyUser, errorHandler, body('token').isJWT(), asyncErrorHandler(postLogout));

//GET /api/active-account/{token}
router.get('/active-account/:token', asyncErrorHandler(getActiveAccount));

//POST /api/forgot-password
router.post('/forgot-password', asyncErrorHandler(postForgotPw));

//PUT /api/reset-password/:token
router.put('/reset-password/:token', asyncErrorHandler(putReset));

module.exports = router;