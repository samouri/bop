var assert = require('assert');
var Promise = require("bluebird");
var mongoose = require('mongoose');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');



var config = require('../config.js');
var apiFactory = require('../api.js');
var api = apiFactory.getAPI();
var songSchema = require("../../shared/models/songSchema.js");
var apiModel = require('../../shared/apiModel.js');
var Song = require("../../shared/models/songModel.js");
var request = {};

mongoose.connect(config.pathToMongoDb);

var songToAdd = {
  youtube_id : 'yFTvbcNhEgc',
  votes : 0,
  user_upvote : 0,
  region_id : 98102,
  user_id: 'testAddSong',
  age: 0,
  artist : 'Angus and Julia Stone',
  track : 'Big Jet Plane',
  duration: 221.64,
  thumbnail_url: 'http://33.media.tumblr.com/avatar_9361c5a980d9_128.png'
};

var songToAddSearchInfo = {
  youtubeId: 'yFTvbcNhEgc',
  youtubeTitle: 'Big Jet Plane Angus',
  thumbnailUrl: 'http://33.media.tumblr.com/avatar_9361c5a980d9_128.png'
};

describe('api', function() {
  var model = apiModel.operations;

  // reset data in db
  before(function() {
    Song.remove({}).then(function() { // removes all of the songs in the db

      var testDataPath = path.resolve(__dirname, 'testData.json');
      var data = JSON.parse(fs.readFileSync(testDataPath));
      Song.collection.insertMany(data);
    });
  });

  describe('#' + model.GET_SONGS_IN_REGION, function () {
    it('Should return an empty array if there are no songs in a region', function () {
      params = {
        operation: model.GET_SONGS_IN_REGION,
        regionId: "Seattle39429384902384"
      };

      var promise = api[params.operation](params);
      return promise.then(function(songs) {
        assert.equal(songs.length, 0);
      });
    });

    it('Should return a list of Song objects for a region with songs', function () {
      params = {
        operation: model.GET_SONGS_IN_REGION,
        regionId: "98102"
      };

      var promise = api[params.operation](params);
      return promise.then(function(songs) {
        assert(songs.length > 0);
        _.each(songs, function(song) {
          assert(song instanceof Song);
        });
      });
    });

    it('If there are more than pageSize number of songs in the region only return pageSize songs', function () {
      params = {
        operation: model.GET_SONGS_IN_REGION,
        regionId: "98102",
        pageSize: 5
      };

      var promise = api[params.operation](params);
      return promise.then(function(songs) {
        assert(songs.length  === 5);
        _.each(songs, function(song) {
          assert(song instanceof Song);
        });
      });
    });
  });

  describe('#' + model.ADD_SONG_TO_REGION, function () {
    it('Should add a song to a region s.t. when you lookup songs in that region it will be there', function () {
      var regionId = "Seattle";
      params = {
        operation: model.ADD_SONG_TO_REGION,
        regionId: regionId,
      };
      params = _.extend(params, songToAddSearchInfo)

      var promise = api[params.operation](params);
      return promise.then(function(saved) {
        songsPromise = api[model.GET_SONGS_IN_REGION](params).then(function(songs) {
          assert(songs.length > 0);
          assert(songs[0].track === songToAdd.track);
          assert(songs[0].youtubeId === songToAdd.youtubeId);
          assert(songs[0].duration === songToAdd.duration);
        });
        return songsPromise;
      });
    });
  });

  describe('#' + model.UPVOTE_SONG, function () {
    it('Should increment votes on a song if user hasnt voted on a song yet', function () {
      var regionId = "Seattle";
      params = {
        operation: model.UPVOTE_SONG,
        regionId: regionId,
        youtubeId: songToAddSearchInfo.youtubeId,
        user: "test"
      };

      var promise = api[params.operation](params);
      return promise.then(function(song) {
        assert.equal(song.votes, 1);
      });
    });

    it('Should decrement votes on a song if user has already upvoted a song', function () {
      var regionId = "Seattle";
      params = {
        operation: model.UPVOTE_SONG,
        regionId: regionId,
        youtubeId: songToAddSearchInfo.youtubeId,
        user: "test"
      };

      var promise = api[params.operation](params);
      return promise.then(function(song) {
        assert.equal(song.votes, 0);
      });
    });
  });
});
