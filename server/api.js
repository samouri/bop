var request = require("request");
var validator = require('validator');
var Promise = require("bluebird");
var _ = require('underscore');

var songSchema = require("../shared/models/songSchema.js");
var Song = require("../shared/models/songModel.js");
var ApiModel = require("../shared/apiModel.js");
var passwordless = require('./passwordless');

var apiFactory = {
  model: _.extend(ApiModel.operations, ApiModel.headers),

  getAPI: function() {
    var model = this.model;
    var api = {};

    api[model.GET_SONGS_IN_REGION] = getSongsInRegion;
    api[model.GET_SONGS_FOR_USER]  = getSongsForUser;
    api[model.GET_USER_INFO]  = getUserInfo;

    api[model.ADD_SONG_TO_REGION] = addSong;
    api[model.ADD_SONG_TO_USER] = addSong;
    api[model.UPVOTE_SONG] = upvoteSong;
    api[model.SEND_TOKEN] = sendToken;

    return api;
  },

  handlePost: function(req, res, next) {
    var model = this.model;
    var api = this.getAPI();
    var params = getParamsFromReq(req);
    var operation = params.operation;

    if (operation === model.GET_SONGS_IN_REGION || operation === model.GET_SONGS_FOR_USER) {
      var promise = api[operation](params);
      promise.then(function(songs) {
        res.send({
          "OutputToken": songs.outputToken || params.start,
          "Songs": songs
        });
      });
    }
    else if (operation === model.ADD_SONG_TO_REGION || operation === model.ADD_SONG_TO_USER) {
      var promise = api[operation](params);
      addSong(params).then(function(s) {
        console.log(s);
        res.send({"Status": s});
      });
    }
    else if (operation === model.GET_USER_INFO) {
      getUserInfo(req, res);
      console.log(req.user);
    }
    else if (operation === model.UPVOTE_SONG) {
      upvoteSong(params).then(function(s) {
       console.log(s);
       res.send({"Status": s});
      });;
    }
    else if (operation === model.SEND_TOKEN) {
      sendToken(req, res, next);
    }
    else if (operation === model.LOGOUT) {
      passwordless.logout(req, res, next);
    }
    else {
      res.send("errawr");
    }
  }
}

function sendToken(req, res, next) {
  var userEmail = req.body["UserEmail"];
  if (validator.isEmail(userEmail)) {
    passwordless.sendToken(req, res, next);
  }
}

function getUserInfo(req, res) {
  var userInfo = {};
  if (req.user) {
    userInfo = {
      username: req.user.substring(0, req.user.indexOf("@")),
      email: req.user
    }
  }
  res.send(userInfo);
}

function upvoteSong(params) {
  return new Promise(function(resolve) {
    Song.findSongs(_.omit(params, "user")).then(function(songs) {
      resolve(songs[0].upvote(params.user));
    });
  });
}

function addSong(params) {
  var model = apiFactory.model;

  return new Promise(function(resolve) {
    getSongMetadata(params, function(song_data) {
      if (params.operation === model.ADD_SONG_TO_REGION) {
        song_data.region_id = params.regionId
      } else {
        song_data.user_id = params.user
      }
      params.song_data = song_data;
      resolve(Song.addSong(params));
    });
  });
}

function getSongMetadata(params, callback) {
  var youtubeId = params.youtubeId;
  var youtubeTitle = params.youtubeTitle;
  var thumbnailUrl = params.thumbnailUrl;

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

function getSongsForUser(params) {
  params.pageSize = params.pageSize || 50;
  params.start = params.start || 0;

  return new Promise(function(resolve, reject) {
    countPromise = Song.countSongsForUser(params.user);
    countPromise.then(function(count) {
      if (params.start >= count) {
        resolve([]);
      }

      songsPromise = Song.findSongsForUser(params);
      songsPromise.then(function(songs) {
        songs.outputToken = (params.start+params.pageSize >= count) ? count : params.start+params.pageSize;
        resolve(songs);
      });
    });
  });
}

function getSongsInRegion(params) {
  params.start = params.start || 0;
  params.pageSize = params.pageSize || 50;

  return new Promise(function(resolve, reject) {
    var countPromise = Song.countSongsInRegion(params.regionId);
    countPromise.then(function(count) {
      if (params.start >= count) {
        resolve([]);
      }
      var songsPromise = Song.findSongsInRegion(params);
      songsPromise.then(function(songs) {
        songs.outputToken = (params.start+params.pageSize >= count) ? count : params.start+params.pageSize;
        resolve(songs);
      });;
    });
  });
}

function getParamsFromReq(req) {
  var body = req.body;
  var model = ApiModel.headers;

  var params = {
    operation: req.headers[model.OPERATION_HEADER],
    user: req.user,
    regionId: body[model.REGION_HEADER],
    start: body["InputToken"],
    thumbnailUrl: body["ThumbnailUrl"],
    youtubeId: body["SongId"],
    youtubeTitle: body["SongTitle"],
    artist: body["SongArtist"],
    type: body["Type"],
    star: body["Star"]
  };

  params = _.pick(params, _.identity); // act like compactObject. remove all falsy values
  return params;
}

module.exports = apiFactory;
