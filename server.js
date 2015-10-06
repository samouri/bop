var url = require('url');
var express = require('express');
var proxy = require('proxy-middleware');
var app = express();
var bodyParser = require('body-parser');
var request = require("request");
var async = require('async');


var appRoute = function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.sendFile(__dirname + '/index.html');
}

app.use(express.static('static'));
app.use(bodyParser.json());

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

var fs = require('fs');
var seattle = JSON.parse(fs.readFileSync('seattle.json', 'utf8'));
var db = {"Seattle": seattle}

app.post('/', function(req, res) {
  var operation = req.headers["x-bop-operation"];
  var regionId = req.body["RegionId"];
  var start = req.body["InputToken"];
  var thumbnailUrl = req.body["ThumbnailUrl"];
  var youtubeId = req.body["SongId"];
  var youtubeTitle = req.body["SongTitle"];

  if (operation === "GetTopSongsInRegion") {
    res.send(getTopSongsInRegion(regionId, start));
  }
  else if (operation === "AddSongToRegion") {
    addSongToRegion(regionId, youtubeId, youtubeTitle, thumbnailUrl);
    res.send("A-OK");
  }
  else if (operation === "UpvoteSong") {
    upvoteSong(regionId, youtubeId);
    res.send("A-OK");
  }
});

function upvoteSong(regionId, youtubeId) {
  db[regionId] = db[regionId] || [];
  var song = db[regionId].find(function(elem){ return elem["youtube_id"] === youtubeId});
  song.upvotes += 1;
}

function addSongToRegion(regionId, youtubeId, youtubeTitle, thumbnailUrl) {
  echosearchUrl = "http://developer.echonest.com/api/v4/song/search?api_key=LBRJASRIEOPXQGYXE&format=json&song_type=live:false&bucket=audio_summary&rank_type=relevance&results=1&combined="
  request.get(echosearchUrl + encodeURIComponent(youtubeTitle), function(error, response, body) {
    body = JSON.parse(body);
    resp_song_info = body["response"]["songs"][0];
    add_song_info = {
      "youtube_id": youtubeId,
      "upvotes": 0,
      "user_upvote": 0,
      "region_id": regionId,
      "age": 0,
      "metadata": {
        "artist": resp_song_info["artist_name"],
        "track": resp_song_info["title"],
        "duration": resp_song_info["audio_summary"]["duration"],
        "thumbnail_url": thumbnailUrl,
        "echoId": resp_song_info["id"]
      }
    }
    db[regionId] = db[regionId] || [];
    db[regionId].push(add_song_info);
  });
}

function getTopSongsInRegion(regionId, start, pageSize) {
  if (db[regionId] === undefined || db[regionId].length <= start) {
    return {
      Songs: [], OutputToken: start
    };
  }
  pageSize = pageSize || 5;
  start = start || 0;

  var end;
  if (start + pageSize <= db[regionId].length) {
    end = start + pageSize;
  } else {
    end = db[regionId].length;
  }

  var response = {
    Songs: db[regionId],
    OutputToken: db[regionId].length
  };

  return response;
}
