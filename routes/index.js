const express = require('express');
const router = express.Router();

const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

const {
  landingPage,
  postRegister,
  postLogin,
  getActiveAccount
} = require('../controllers');

const {
  asyncErrorHandler
} = require('../middlewares');

//GET /
// res.json({ data: posts, message, success })
router.get('/', asyncErrorHandler(landingPage));

//POST /register | body(image: file, fullName: String, email: String, password: String)
// res.json({ message, success })
router.post('/register', upload.single('image'), asyncErrorHandler(postRegister));

//POST /login | body(email: String, password: String)
// res.json({ data: {user, token}, message, success })
router.post('/login', asyncErrorHandler(postLogin));

//GET /active-account/:token
// res.json({ message, success })
router.get('/active-account/:token', asyncErrorHandler(getActiveAccount));

//POST /forgot-password | body(email: String)
// res.json({ message, success })
router.post('/forgot-password');

//GET /reset-password/:token
// res.json({ data: token, message, success })
router.get('/reset-password/:token');

//PUT /reset-password/:token | body(password: String)
// res.json({ message, success })
router.put('/reset-password/:token');

module.exports = router;