var createError = require('http-errors');
var express = require('express');
var session = require('express-session')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const user = require('./lib/middleware/user')
const register = require('./routes/register');
const login = require('./routes/login');
const messages = require('./lib/messages');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(user);
app.use(messages);
app.use(app.router);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/register', register.form);
app.post('/register', register.submit);

app.get('./login', login.form);
app.post('./login', login.submit);
app.get('./logout', login.logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
