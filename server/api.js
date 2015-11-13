var request = require("request");
var validator = require('validator');

var Song = require("../shared/models/song.js");
var passwordless = require('./passwordless');

var api = {
  handlePost: function(req, res, next) {
    var operation = req.headers["x-bop-operation"];
    var regionId = req.body["RegionId"];
    var start = req.body["InputToken"];
    var thumbnailUrl = req.body["ThumbnailUrl"];
    var youtubeId = req.body["SongId"];
    var youtubeTitle = req.body["SongTitle"];
    var type = req.body["Type"];
    var star = req.body["Star"];
    if (operation === "GetSongsInRegion") {
      getSongsInRegion(res, regionId, type, start, undefined, req.user);
    }
    else if (operation === "GetSongsForUser") {
      getSongsForUser(res, start, undefined, req.user);
    }
    else if (operation === "AddSongToRegion") {
      addSongToRegion(res, regionId, youtubeId, youtubeTitle, thumbnailUrl, req.user);
    }
    else if (operation === "AddSongToUser") {
      addSongToUser(res, youtubeId, youtubeTitle, thumbnailUrl, req.user);
    }
    else if (operation === "UpvoteSong") {
      upvoteSong(res, regionId, youtubeId, req.user);
    }
    else if (operation === "SendToken") {
      var userEmail = req.body["UserEmail"];
      if (validator.isEmail(userEmail)) {
        passwordless.sendToken(req, res, next);
      }
    }
    else if (operation === "Logout") {
      passwordless.logout(req, res, next);
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
  }
}

function upvoteSong(res, regionId, youtubeId, user) {
  if (! user) {
    res.send("Error: Must be signed in");
    return;
  }
  Song.findSong(regionId, youtubeId, function(song) {
    song.upvote(user);
  });
  res.send("A-OK");
}

function addSongToUser(res, youtubeId, youtubeTitle, thumbnailUrl, user) {
  if (! user) {
    console.log("Error: user must be signed in to addSongToUser");
    return;
  }
  getSongMetadata(youtubeId, youtubeTitle, thumbnailUrl, function(song_data) {
    song_data["user_id"] = user,
    Song.addSongToUser(user, song_data);
    res.send("A-OK");
  });
}

function addSongToRegion(res, regionId, youtubeId, youtubeTitle, thumbnailUrl, user) {
  if (! user) {
    console.log("Error: user must be signed in to addSongToRegion");
    return;
  }
  getSongMetadata(youtubeId, youtubeTitle, thumbnailUrl, function(song_data) {
    song_data["region_id"] = regionId,
    Song.addSongToRegion(regionId, song_data);
    res.send("A-OK");
  });
}

function getSongMetadata(youtubeId, youtubeTitle, thumbnailUrl, callback) {
  echosearchUrl = "http://developer.echonest.com/api/v4/song/search?api_key=LBRJASRIEOPXQGYXE&format=json&song_type=live:false&bucket=audio_summary&rank_type=relevance&results=1&combined="
  request.get(echosearchUrl + encodeURIComponent(youtubeTitle), function(error, response, body) {
    body = JSON.parse(body);
    resp_song_info = body["response"]["songs"][0];
    add_song_info = {
      "youtube_id": youtubeId,
      "artist": resp_song_info["artist_name"],
      "track": resp_song_info["title"],
      "thumbnail_url": thumbnailUrl,
      "echo_id": resp_song_info["id"],
      "duration": resp_song_info["audio_summary"]["duration"]
    }
    callback(add_song_info);
  });
}

function getSongsForUser(res, start, pageSize, user) {
  pageSize = pageSize || 50;
  start = start || 0;

  Song.countSongsForUser(user, function(count) {
    if (start >= count) {
      res.send({ Songs: [], OutputToken: start});
      return;
    }

    var outputToken = (start+pageSize > count) ? count : start+pageSize;
    Song.findSongsForUser(start, pageSize, user, function(songs) {
      var response = {
        Songs: songs,
        OutputToken: outputToken
      };
      res.send(response);
    });
  });
}

function getSongsInRegion(res, regionId, type, start, pageSize, user) {
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
    getSongsFn(regionId, start, pageSize, user, function(songs) {
      var response = {
        Songs: songs,
        OutputToken: outputToken
      };
      res.send(response);
    });
  });
}


module.exports = api;
