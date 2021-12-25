const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const compression = require('compression');
const helmet = require('helmet');
const methodOverride = require('method-override');
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const cron = require('node-cron');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const postsRouter = require('./routes/posts');
const reviewsRouter = require('./routes/reviews');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(methodOverride('_method'));

//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function(){ console.log('MongoDB connection open'); });
require('./models/User');
require('./models/Post');
require('./models/Review');
// const seedPosts = require('./seeds');
// seedPosts();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

const {
  calculate_user_statistics,
  calculate_post_statistics
} = require('./services/calculate_statistics_service');

const {
  update_user_score,
  update_post_score
} = require('./services/calculate_score_service');

cron.schedule('*/3 * * * *', function () {
  calculate_user_statistics();
  calculate_post_statistics();
  console.log('Calculated statistics information on ' + new Date());
});

cron.schedule('*/1 * * * *', function () {
  update_user_score();
  update_post_score();
  console.log('Successfully updated system data on ' + new Date())
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
require('./middlewares/authenticate');

app.use('/api', indexRouter);
app.use('/api/user', userRouter);
app.use('/api/posts', postsRouter);
app.use('/api/posts/:id/reviews', reviewsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  if (err.http_code) err.status = err.http_code;

  // render the error page
  res.status(err.status || 500);
  res.json({});
});

module.exports = app;