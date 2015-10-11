'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email:     { type: String, required: true, index: { unique: true }},
  songLikes: { type: Array, default: []}
});


// Methods
userSchema.methods.likeSong = function(song) {
  this.songLikes.push(song);
  this.save(function(err, user) {
    if (err) {
      console.log(err);
    }
  });
}

// Statics
userSchema.statics.findUser = function(email, callback) {
  email = email.toLowerCase();
  this.findOne({ email: email }, callback);
};


// Export Model
var User = mongoose.model("User", userSchema);
module.exports = User;
