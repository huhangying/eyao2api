const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

// 公用库
global.Status = require('./util/status.js');
global.mongoose = require('mongoose');
global.Schema = global.mongoose.Schema;
global.moment = require('moment');
global.Consts = require('./util/consts.js');
global.mongoose.connect('mongodb://192.168.87.250/eyao', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
 });

const routes = require('./routes/index');

const app = express();

//设置跨域访问
app.use(cors());
app.all('*', function (req, res, next) {
  res.header("X-Powered-By", 'hwem')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

// view engine setup
app.set('views', path.join(path.resolve(), 'views'));
app.set('view engine', 'ejs');
app.set('view options', {
  layout: false
});
app.disable('etag'); //avoid 304 error

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(path.resolve(), 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500)
      .render('error', {
        message: err.message,
        error: err
      });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500)
    .render('error', {
      message: err.message,
      error: {}
    });
});

module.exports = app;
