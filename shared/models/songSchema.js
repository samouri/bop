'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = mongoose.Schema.Types.Mixed;

// Schema Definition
var songSchema = new Schema({
  youtube_id:    { type: String, required: true },
  region_id:     { type: String, required: false },
  user_id:       { type: String, required: false },
  artist:        { type: String, required: true },
  track:         { type: String, required: true },
  thumbnail_url: { type: String, required: true },
  echo_id:       { type: String },
  votes:         { type: Number, default: 0 },
  duration:      { type: Number, default: 42 },
  date_added:    { type: Date, default: Date.now },
  users_that_upvoted: { type: Mixed, default: {}}
});

module.exports = songSchema;
