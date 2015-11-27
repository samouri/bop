var _ = require('underscore');

var apiModel = {
  operations: {
    GET_SONGS_IN_REGION: "GetSongsInRegion",
    GET_SONGS_FOR_USER: "GetSongsForUser",
    GET_USER_INFO: "GetUserInfo",
    ADD_SONG_TO_REGION: "AddSongToRegion",
    ADD_SONG_TO_USER: "AddSongToUser",
    UPVOTE_SONG: "UpvoteSong",
    SEND_TOKEN: "SendToken",
    LOGOUT: "Logout"
  },

  headers: {
    MODEL: "model",
    OPERATION_HEADER: "x-bop-operation",
    REGION_HEADER: "RegionId",
    SONG_ID_HEADER: "SongId",
    START_HEADER: "InputToken"
  },

  getClient: function() {
    var model = _.clone(this.operations);
    var client = {};
    _.each(_.keys(model), function(method) { client[model[method]] = generatePost.bind(this, model[method]) });

    return client;
  },
}

function generatePost(operation, data, handlers) {
  var model = apiModel.headers;

  if( _.isNull(handlers) || _.isUndefined(handlers)) {
    handlers = {}
  }

  if( _.isNull(data) || _.isUndefined(data)) {
    data = {}
  }

  var headers = {}
  headers[model.OPERATION_HEADER] = operation;
  headers["Content-Type"] = "application/json";

  return {
    url: "/",
    type: "POST",
    headers: headers,
    data: JSON.stringify(data),
    success: handlers["success"],
    error: handlers["error"]
  }
}

module.exports = apiModel;
