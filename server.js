var express = require('express');
var app = express();

var appRoute = function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.sendFile(__dirname + '/index.html');
}

app.use(express.static('static'));

app.get('/', appRoute);
app.get('/*', appRoute);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
