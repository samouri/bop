'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = mongoose.Schema.Types.Mixed;
var _ = require("underscore");
var sha1 = require('sha1');

// Schema Definition
var songSchema = new Schema({
  youtube_id:    { type: String, required: true },
  region_id:     { type: String, required: false },
  user_id:       { type: String, required: false },
  artist:        { type: String, required: true },
  track:         { type: String, required: true },
  thumbnail_url: { type: String, required: true },
  echo_id:       { type: String, required: true },
  votes:         { type: Number, default: 0 },
  duration:      { type: Number, default: 42 },
  date_added:    { type: Date, default: Date.now },
  users_that_upvoted: { type: Mixed, default: {}}
});


// Methods
songSchema.methods.upvote = function(user) {
  var userSha = sha1(user);
  if (! this.users_that_upvoted[userSha]) {
    this.votes += 1;
    this.users_that_upvoted[userSha] = true;
    this.markModified('users_that_upvoted');
    this.save(function(err, song) {
      if (err) {
        console.log(err);
      }
    });
  }
}

function prepUsersThatUpvoted(user, song) {
  var clone = song.toObject();
  clone.upvoted = false;
  if (user && song.users_that_upvoted[sha1(user)]) {
    clone.upvoted = true;
  }
  return _.omit(clone, "users_that_upvoted");
}

// Statics
songSchema.statics.findSongForUser = function(user, youtubeId, callback) {
  this.findOne({ user_id: user, youtube_id: youtubeId }, function(err, song) {
    if(err) {
      console.log(err);
    } else {
      callback(song);
    }
  });
}
songSchema.statics.findSong = function(regionId, youtubeId, callback) {
  this.findOne({ region_id: regionId, youtube_id: youtubeId }, function(err, song) {
    if(err) {
      console.log(err);
    } else {
      callback(song);
    }
  });
}

songSchema.statics.findTopSongsInRegion = function(regionId, start, pageSize, user, callback) {
  var query = this.find({region_id: regionId}).sort({votes: -1}).skip(start).limit(pageSize);
  query.exec('find', function(err, items) {
      if (err) { console.log(err) }
      callback(items.map(prepUsersThatUpvoted.bind(undefined, user)));
  });
}

songSchema.statics.findNewSongsInRegion = function(regionId, start, pageSize, user, callback) {
  var query = this.find({region_id: regionId}).sort({date_added: -1}).skip(start).limit(pageSize);
  query.exec('find', function(err, items) {
      if (err) { console.log(err) }
      callback(items.map(prepUsersThatUpvoted.bind(undefined, user)));
  });
}

songSchema.statics.findSongsForUser = function(start, pageSize, user, callback) {
  var query = this.find({user_id: user}).sort({date_added: -1}).skip(start).limit(pageSize);
  query.exec('find', function(err, items) {
      if (err) { console.log(err) }
      callback(items);
  });
}

songSchema.statics.countSongsInRegion = function(regionId, callback) {
  this.count({region_id: regionId}, function(err, count) {
    callback(count);
  });
}

songSchema.statics.countSongsForUser = function(user, callback) {
  console.log(user);
  this.count({user_id: user}, function(err, count) {
    callback(count);
  });
}

songSchema.statics.addSongToRegion = function(regionId, songInfo, callback) {
  this.findSong(regionId, songInfo.youtube_id, function(s) {
    if (s) {
      return;
      console.log("cant have the same song twice");
    }
    var song = Song(songInfo);
    song.save(function(err, song) {
      if (err) {
        console.log(err);
      }
    });
  })
}

songSchema.statics.addSongToUser = function(user, songInfo, callback) {
  console.log("addSongToUser");
  this.findSongForUser(user, songInfo.youtube_id, function(s) {
    if (s) {
      return;
      console.log("cant have the same song twice");
    }
    var song = Song(songInfo);
    console.log(song);
    song.save(function(err, song) {
      if (err) {
        console.log(err);
      }
    });
  })
}

// Export Model
var Song = mongoose.model("Song", songSchema);
module.exports = Song;
