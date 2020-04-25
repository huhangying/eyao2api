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
app.use((req, res) => {
  res.sendStatus(404);
});

app.listen(3000, () => {
  console.log('Server running at 3000 port.');
});

module.exports = app;
