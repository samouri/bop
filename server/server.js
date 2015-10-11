var url = require('url');
var path = require('path');
var express = require('express');
var proxy = require('proxy-middleware');
var app = express();
var bodyParser = require('body-parser');

var request = require("request");
var async = require('async');
var session = require('express-session');
var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var email = require("emailjs");
var mongoose = require('mongoose');
var Song = require("../shared/models/song.js");
var User = require("../shared/models/user.js");


var smtpServer  = email.server.connect({
  user: "boptoken@gmail.com",
  password: "boptest123",
  host: "smtp.gmail.com",
  ssl: true,
  port: 465
});

// http://stackoverflow.com/questions/2855865/jquery-regex-validation-of-e-mail-address
function isValidEmailAddress(emailAddress) {
  var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
  return pattern.test(emailAddress);
};

var pathToMongoDb = 'mongodb://localhost/test';
passwordless.init(new MongoStore(pathToMongoDb));
mongoose.connect(pathToMongoDb);

passwordless.addDelivery(
  function(tokenToSend, uidToSend, recipient, callback) {
    var host = 'nothingtoseehere.xyz';
    smtpServer.send({
      text:    'Hello!\nAccess your account here: http://'
      + host + '?token=' + tokenToSend + '&uid='
      + encodeURIComponent(uidToSend),
      from:    "boptoken@gmail.com",
      to:      recipient,
      subject: 'Token for ' + host
    }, function(err, message) {
      if(err) {
        console.log(err);
      }
      callback(err);
    });
  }
);

var index = process.env.NODE_ENV === "production" ? "index.prod.html" : "index.html";

var appRoute = function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.locals.user = req.user;
  res.sendFile(path.resolve(index));
}

app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat' }));
app.use(passwordless.sessionSupport());
app.use(passwordless.acceptToken({successRedirect: '/' }));
app.use(express.static('static'));

//proxy the request for static assets
app.use('/assets', proxy(url.parse('http://localhost:8090/assets')));
app.use('/webpack-dev-server.js', proxy(url.parse('http://localhost:8090/webpack-dev-server.js')));

app.get('/', appRoute);
app.get('/*', appRoute);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

app.post('/', function(req, res, next) {
  var operation = req.headers["x-bop-operation"];
  var regionId = req.body["RegionId"];
  var start = req.body["InputToken"];
  var thumbnailUrl = req.body["ThumbnailUrl"];
  var youtubeId = req.body["SongId"];
  var youtubeTitle = req.body["SongTitle"];
  var type = req.body["Type"];
  var star = req.body["Star"];

  if (operation === "GetSongsInRegion") {
    if (star) {
      regionId = regionId.hashCode();
    }
    getSongsInRegion(res, regionId, type, start);
  }
  else if (operation === "AddSongToRegion") {
    addSongToRegion(res, regionId, youtubeId, youtubeTitle, thumbnailUrl);
  }
  else if (operation === "UpvoteSong") {
    upvoteSong(res, regionId, youtubeId, req.user);
  }
  else if (operation === "SendToken") {
    var userEmail = req.body["UserEmail"];
    if (isValidEmailAddress(userEmail)) {
      sendToken(req, res, next);
    }
  }
  else if (operation === "Logout") {
    passwordless.logout()(req, res, next);
  }
  else if (operation === "GetUserInfo") {
    var userInfo = {};
    if (req.user) {
      userInfo = {
        username: req.user.substring(0, req.user.indexOf("@")),
        email: req.user
      }
    }
    res.send(userInfo);
  }
  else {
    res.send("errawr");
  }
});

function sendToken(req, res, next) {
  passwordless.requestToken(
    function(user, delivery, callback) {
      callback(null, user);
    }, {"userField": "UserEmail"}
  )(req,res,next);
}

function upvoteSong(res, regionId, youtubeId, user) {
  if (! user) {
    console.log("Error: user must be signed in");
    //res.send("Error: Must be signed in");
    //return;
  }
  Song.findSong(regionId, youtubeId, function(song) {
    song.upvote(user);
  });
  res.send("A-OK");
}

function addSongToRegion(res, regionId, youtubeId, youtubeTitle, thumbnailUrl) {
  echosearchUrl = "http://developer.echonest.com/api/v4/song/search?api_key=LBRJASRIEOPXQGYXE&format=json&song_type=live:false&bucket=audio_summary&rank_type=relevance&results=1&combined="
  request.get(echosearchUrl + encodeURIComponent(youtubeTitle), function(error, response, body) {
    body = JSON.parse(body);
    resp_song_info = body["response"]["songs"][0];
    add_song_info = {
      "youtube_id": youtubeId,
      "region_id": regionId,
      "artist": resp_song_info["artist_name"],
      "track": resp_song_info["title"],
      "thumbnail_url": thumbnailUrl,
      "echo_id": resp_song_info["id"],
      "duration": resp_song_info["audio_summary"]["duration"]
    }

    Song.addSongToRegion(regionId, add_song_info);
    res.send("A-OK");
  });
}

function getSongsInRegion(res, regionId, type, start, pageSize) {
  pageSize = pageSize || 50;
  start = start || 0;
  Song.countSongsInRegion(regionId, function(count) {
    if (start >= count) {
      res.send({ Songs: [], OutputToken: start});
      return;
    }

    var getSongsFn;
    if (type === "top") {
      getSongsFn = Song.findTopSongsInRegion.bind(Song);
    }
    else if (type === "new") {
      getSongsFn = Song.findNewSongsInRegion.bind(Song);
    }
    var outputToken = (start+pageSize > count) ? count : start+pageSize;
    getSongsFn(regionId, start, pageSize, function(songs) {
      var response = {
        Songs: songs,
        OutputToken: outputToken
      };
      res.send(response);
    });
  });
}


// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

