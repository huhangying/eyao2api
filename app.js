const express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 公用库
global._ = require('lodash');
global.Util = require('./util/util.js');
global.Status = require('./util/status.js');
global.mongoose = require('mongoose');
global.mongoose.Promise = require('bluebird');
global.moment = require('moment');
global.mongoose.connect('mongodb://192.168.87.250/eyao', { useMongoClient: true });

var routes = require('./routes/index');

global.Consts = require('./util/consts.js');

const app = express();

//设置跨域访问

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
  res.header("X-Powered-By", 'hwem')
  res.header("Content-Type", "application/json;charset=utf-8");
  //  res.header("Content-Type", "text/html;charset=utf-8");
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('view options', {
  layout: false
});
app.disable('etag'); //avoid 304 error

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//通常 POST 内容的格式是 application/x-www-form-urlencoded, 因此要用下面的方式来使用
//var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
