const express = require('express');
const router = express.Router();

const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

const {
  landingPage,
  postRegister,
  postLogin,
  getActiveAccount,
  postForgotPw,
  putReset
} = require('../controllers');

const {
  asyncErrorHandler
} = require('../middlewares');

//GET /
router.get('/', asyncErrorHandler(landingPage));

//POST /register
router.post('/register', upload.single('image'), asyncErrorHandler(postRegister));

//POST /login
router.post('/login', asyncErrorHandler(postLogin));

//GET /active-account/:token
router.get('/active-account/:token', asyncErrorHandler(getActiveAccount));

//POST /forgot-password
router.post('/forgot-password', asyncErrorHandler(postForgotPw));

//PUT /reset-password/:token
router.put('/reset-password/:token', asyncErrorHandler(putReset));

module.exports = router;