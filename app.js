const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const compression = require('compression');
const helmet = require('helmet');
const methodOverride = require('method-override');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const postsRouter = require('./routes/posts');

const app = express();

app.use(compression());
app.use(helmet());
app.use(methodOverride('_method'));

//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function(){ console.log('MongoDB connection open'); });

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
require('./middlewares/authenticate');

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/posts', postsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (!err) {
    err.message = 'An unspecified error occurred.';
  }

  // render the error page
  res.status(err.status || 500);
  const error = {
    message: err.message,
    success: false
  };
  res.json(error);
});

module.exports = app;