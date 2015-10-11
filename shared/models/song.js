'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = mongoose.Schema.Types.Mixed;

// Schema Definition
var songSchema = new Schema({
  youtube_id:    { type: String, required: true },
  region_id:     { type: String, required: true },
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
  if (! this.users_that_upvoted[user]) {
    this.votes += 1;
    this.users_that_upvoted[user] = true;
    this.save(function(err, song) {
      if (err) {
        console.log(err);
      }
    });
  }
}

// Statics
songSchema.statics.findSong = function(regionId, youtubeId, callback) {
  this.findOne({ region_id: regionId, youtube_id: youtubeId }, function(err, song) {
    if(err) {
      console.log(err);
    } else {
      callback(song);
    }
  });
}

songSchema.statics.findTopSongsInRegion = function(regionId, start, pageSize, callback) {
  var query = this.find({region_id: regionId}).sort({votes: -1}).skip(start).limit(pageSize);
  query.exec('find', function(err, items) {
      if (err) { console.log(err) }
      callback(items);
  });
}

songSchema.statics.findNewSongsInRegion = function(regionId, start, pageSize, callback) {
  var query = this.find({region_id: regionId}).sort({date_added: 1}).skip(start).limit(pageSize);
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

songSchema.statics.addSongToRegion = function(regionId, songInfo, callback) {
  var song = Song(songInfo);
  song.save(function(err, song) {
    if (err) {
      console.log(err);
    }
  });
}

// Export Model
var Song = mongoose.model("Song", songSchema);
module.exports = Song;
