var express = require('express');
var url = require('url');
var path = require('path');
var proxy = require('proxy-middleware');
var bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
var session = require('express-session');
var MongoStore = require('connect-mongostore')(session);
var passwordless = require('./passwordless');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var validator = require('validator');
var app = express();


var config = require('./config.js');
var api = require('./api.js');

var pathToMongoDb = 'mongodb://localhost/test';
mongoose.connect(pathToMongoDb);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'keyboard-cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60*60*24*365*10, secure: false},
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash());
app.use(express.static('static'));
passwordless.setup(app);

var appRoute = function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.sendFile(path.resolve(config.indexPath), {flashMessages: req.flash});
}


//proxy the request for static assets
if (config.dev) {
  app.use('/assets', proxy(url.parse('http://localhost:' + config.assetsPort + '/assets')));
  app.use('/webpack-dev-server.js', proxy(url.parse('http://localhost:8090/webpack-dev-server.js')));
}

app.get('*', appRoute);

var server = app.listen(config.port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Bop server listening at http://%s:%s', host, port);
});

app.post('/', function(req, res, next) {
  api.handlePost(req,res,next);
});

