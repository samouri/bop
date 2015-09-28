var url = require('url');
var express = require('express');
var proxy = require('proxy-middleware');
var app = express();

var appRoute = function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.sendFile(__dirname + '/index.html');
  console.log(req.path);
}

app.use(express.static('static'));
//proxy the request for static assets
app.use('/assets', proxy(url.parse('http://localhost:8090/assets')));
app.use('/webpack-dev-server.js', proxy(url.parse('http://localhost:8090/webpack-dev-server.js')));
app.post('/', proxy(url.parse('http://localhost:5000/')));

app.get('/', appRoute);
app.get('/*', appRoute);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
