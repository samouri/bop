var express = require('express');
var url = require('url');
var path = require('path');
var proxy = require('proxy-middleware');

var app = express();


var config = require('./config/config.js');

app.use(express.static('static'));

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

