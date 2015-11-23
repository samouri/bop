var request = require("request");
var validator = require('validator');
var Promise = require("bluebird");
var _ = require('underscore');

var songSchema = require("../shared/models/songSchema.js");
var Song = require("../shared/models/songModel.js");
var passwordless = require('./passwordless');

var apiFactory = {
  model: {
    MODEL: "model",
    OPERATION_HEADER: "x-bop-operation",
    GET_SONGS_IN_REGION: "GetSongsInRegion",
    GET_SONGS_FOR_USER: "GetSongsForUser",
    GET_USER_INFO: "GetUserInfo",
    ADD_SONG_TO_REGION: "AddSongToRegion",
    ADD_SONG_TO_USER: "AddSongToUser",
    UPVOTE_SONG: "UpvoteSong",
    SEND_TOKEN: "SendToken",
    LOGOUT: "Logout",

    REGION_HEADER: "RegionId",
    SONG_ID_HEADER: "SongId",
    START_HEADER: "InputToken",
    GET_CLIENT: "GetClient"
  },

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

  getClient: function() {
    var model = this.model;
    var client = {};
    _.each(_.keys(getAPI()), function(method) { client[method] = generatePost.bind(method) });

    return client;
  },

  handlePost: function(req, res, next) {
    var model = this.model;
    var api = this.getAPI();
    var params = getParamsFromReq(req);
    var operation = params.operation;
    var promise = api[operation](params);

    if (operation === model.GET_SONGS_IN_REGION || operation === model.GET_SONGS_FOR_USER) {
      promise.then(function(songs) {
        var outputToken = (params.start+params.pageSize > songs.length) ? songs.length : params.start+params.pageSize;
        res.send({
          "Songs": songs,
          "OutputToken": outputToken
        });
      });
    }
    else if (operation === model.ADD_SONG_TO_REGION || operation === model.ADD_SONG_TO_USER) {
      addSong(params);
    }
    else if (operation === model.UPVOTE_SONG) {
      upvoteSong(res, regionId, youtubeId, req.user);
    }
    else if (operation === model.SEND_TOKEN) {
      sendToken(req, res, next);
    }
    else if (operation === model.LOGOUT) {
      passwordless.logout(req, res, next);
    }
    else if (operation === model.GET_USER_INFO) {
      getUserInfo(req,res);
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

function addSong(params) {
  var model = apiFactory.model;

  return new Promise(function(resolve) {
    getSongMetadata(params.songData, function(song_data) {
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

      //  var outputToken = (start+pageSize > count) ? count : start+pageSize;
      songsPromise = Song.findSongsForUser(params);
      songsPromise.then(function(songs) {
        resolve(songs);
      });
    });
  });
}

function getSongsInRegion(params) {
  var start = params.start || 0;
  var regionId = params.regionId;

  return new Promise(function(resolve, reject) {
    var countPromise = Song.countSongsInRegion(regionId);
    countPromise.then(function(count) {
      if (start >= count) {
        resolve([]);
      }
      var songsPromise = Song.findSongsInRegion(params);
      songsPromise.then(function(songs) {
        resolve(songs);
      });;
    });
  });
}

function generatePost(operation, data, handlers) {
  var model= this.model;

  if( _.isNull(handlers) || _.isUndefined(handlers)) {
    handlers = {}
  }

  if( _.isNull(data) || _.isUndefined(data)) {
    data = {}
  }

  headers = {}
  headers[model.OPERATION_HEADER] = operation;
  headers["Content-Type"] = "application/json";
  params = {
    url: "/",
    type: "POST",
    headers: headers,
    data: JSON.stringify(data),
    success: handlers["success"],
    error: handlers["error"]
  };
}

function getParamsFromReq(req) {
  var body = req.body;
  var model = api.model;

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

  if (! _.isUndefined(ret.song)) {
    ret.song.validate(function(error) {
      throw "InvalidSongInParams";
    });
  }

  params = _.pick(params, _.identity); // act like compactObject. remove all falsy values
  return params;
}

module.exports = apiFactory;
