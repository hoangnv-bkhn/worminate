const createError = require('http-errors');
const express = require('express');
const engine = require('ejs-mate');
const favicon = require('serve-favicon');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport')
const compression = require('compression');

const User = require('./models/user');
const session = require('express-session')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const authenticate = require('./middleware/authenticate');
// const seedPosts = require('./seeds');
// seedPosts();

// require routes
const indexRouter = require('./routes/index');
const adminRoutes = require('./routes/admin');
const postsRouter = require('./routes/posts');
const reviewsRouter = require('./routes/reviews');

const app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('securePort') + req.url);
  }
});

app.use(compression());

// Configure Passport and Sessions

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}))

//Set up mongoose connection
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useCreateIndex: true, useFindAndModify: false, useNewUrlParser: true , useUnifiedTopology: true, autoIndex: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function(){ console.log('MongoDB connection open'); });

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(passport.initialize());
app.use(passport.session());

// set local constiables middleware
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  //set default page title
  res.locals.title = "Worminate";
  // set success flash message
  res.locals.success = req.session.success || '';
  delete req.session.success;
  // set error flash message
  res.locals.error = req.session.error || '';
  delete req.session.error;
  // continue on to next function in the middleware chain
  next();
});

// Mount routes
app.use('/', indexRouter);
app.use('/admin', adminRoutes);
app.use('/posts', postsRouter);
app.use('/posts/:id/reviews', reviewsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  console.log(err);
  req.session.error = err.message;
  res.redirect('back');
});

module.exports = app;
