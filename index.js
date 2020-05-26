const express = require('express');
const cors = require('cors');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.87.250/eyao', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

global.Status = require('./util/status.js');
global.urlencodedParser = bodyParser.urlencoded({ extended: false });

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { onConnect } = require('./io/socketio');

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

app.use(express.static(path.join(path.resolve(), 'public')));

const routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use('*', (req, res) => {
  res.sendStatus(404);
});

// error handling
app.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  } else {
    res.status(err.status || 503).send(err);
  }
});

io.on('connection', onConnect);

server.listen(3000, () => {
  console.log('Server running at 3000 port.');
});
