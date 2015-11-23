' use strict';

var Promise = require("bluebird");
var mongoose = require('mongoose');
mongoose.Promise = Promise;

var songSchema = require('./songSchema.js');
var _ = require("underscore");
var sha1 = require('sha1');


// Methods
songSchema.methods.upvote = function(user) {
  var userSha = sha1(user);

  if (this.users_that_upvoted[userSha]) {
    this.votes -= 1;
    this.users_that_upvoted[userSha] = false;
  }
  else {
    this.votes += 1;
    this.users_that_upvoted[userSha] = true;
  }

  this.markModified('users_that_upvoted');
  this.save(function(err, song) {
    if (err) {
      console.log(err);
    }
  });
}

function prepUsersThatUpvoted(user, song) {
  var clone = song.toObject();
  clone.upvoted = false;

  if (user && song.users_that_upvoted[sha1(user)]) {
    clone.upvoted = true;
  }
  return _.omit(clone, "users_that_upvoted");
}

function prepSongsForStars(user, songList, callback) {
  songSchema.findSongsForUser(0, songList.length, user, function(starredSongs) {

  });
}

// Statics
songSchema.statics.findSongsInRegion = function(params) {
  params.find = {region_id: params.regionId}
  if (params.type === "top") {
    params.sort = {votes: -1};
  }

  return songSchema.statics.findSongs.bind(this)(params);
}

songSchema.statics.findSongsForUser = function(params) {
  params.find = {user_id: params.user}
  return songSchema.statics.findSongs.bind(this)(params);
}

songSchema.statics.findSongs = function(params) {
  var start = params.start || 0;
  var pageSize = params.pageSize || 5;
  var find = params.find;
  var sort = params.sort || {date_added: -1};
  var query = this.find(find).sort(sort).skip(start).limit(pageSize);
  return query.exec();
}

songSchema.statics.countSongsInRegion = function(regionId) {
  return this.count({region_id: regionId}).exec();
}

songSchema.statics.countSongsForUser = function(user) {
  return this.count({user_id: user}).exec();
}

songSchema.statics.addSong = function(params) {
  var song = params.song_data;

  params.find = {
    user_id: song.user_id,
    region_id: song.region_id,
    youtube_id: song.youtube_id
  }

  var songsPromise = this.findSongs(params);
  return songsPromise.then(function(songs) {
    if (songs.length > 0 ) {
      console.log("cant have the same song twice");
      return false;
    }
    var Song = mongoose.model("Song", songSchema);
    var s = Song(song);
    return s.save();
  })
}

// Export Model
module.exports = mongoose.model("Song", songSchema);
