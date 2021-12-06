const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });
const passport = require('passport');
const {
  landingPage,
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  postLoginFacebook,
  getLinkWithFacebook,
  postLoginGoogle,
  getLinkWithGoogle,
  getLogout,
  getProfile,
  updateProfile,
  getForgotPw,
  putForgotPw,
  getReset,
  putReset,
} = require('../controllers')
const {
  asyncErrorHandler,
  isLoggedIn,
  isLoggedInSocial,
  isAdmin,
  isValidPassword,
  changePassword
} = require('../middleware')

/* GET home/landing page. */
router.get('/', asyncErrorHandler(landingPage));

/* GET /register. */
router.get('/register', isLoggedIn(true), getRegister);

/* POST /register. */
router.post('/register', isLoggedIn(true), upload.single('image'), asyncErrorHandler(postRegister));

/* GET /login. */
router.get('/login', isLoggedIn(true), getLogin);

/* POST /login. */
router.post('/login', isLoggedIn(true), asyncErrorHandler(postLogin), (req, res, next) => {
  res.send('POST /login');
});

/* GET /login Facebook. */
router.get('/auth/facebook',
  passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback',
  isLoggedInSocial(asyncErrorHandler(getLinkWithFacebook)),
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  asyncErrorHandler(postLoginFacebook));

/* GET /login Google. */
router.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));

router.get('/auth/google/callback',
  isLoggedInSocial(asyncErrorHandler(getLinkWithGoogle)),
  passport.authenticate('google', { failureRedirect: '/login' }),
  asyncErrorHandler(postLoginGoogle));

/* GET /logout. */
router.get('/logout', getLogout);

/* GET /profile. */
router.get('/profile', isLoggedIn(), asyncErrorHandler(getProfile));

/* PUT /profile. */
router.put('/profile',
  isLoggedIn(),
  upload.single('image'),
  asyncErrorHandler(isValidPassword),
  asyncErrorHandler(changePassword),
  asyncErrorHandler(updateProfile)
);

/* GET /forgot-password. */
router.get('/forgot-password', isLoggedIn(true), getForgotPw);

/* PUT /forgot-password. */
router.put('/forgot-password', isLoggedIn(true), asyncErrorHandler(putForgotPw));

/* GET /reset/:token. */
router.get('/reset/:token', isLoggedIn(true), asyncErrorHandler(getReset));

/* PUT /reset/:token. */
router.put('/reset/:token', isLoggedIn(true), asyncErrorHandler(putReset));

module.exports = router;
