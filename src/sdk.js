var Swagger = require('swagger-client');

var sdk = function(client) {
  this.client = client;

  this.login = function(username, password) {
    this.client.clientAuthorizations.add('basicAuth',
        new Swagger.PasswordAuthorization(username, password));
	}

  this.getSongsForPlaylist = function(playlist, start, size) {
    return this.client.Playlist.playlistNameGET({name: playlist, start: start, size: size});
  }

  this.addSongToPlaylist = function(playlist, song) {
    return this.client.default.playlistNamePOST({name: playlist, song: song});
  }

  this.getUser = (optionalUsername, optionalPassword) => {
    if ( optionalUsername && optionalPassword ) {
      return this.client.User.userGET(null, {
          clientAuthorizations: {
            basicAuth: new Swagger.PasswordAuthorization(optionalUsername, optionalPassword),
          }
      });
    }
    return this.client.User.userGET();
  }

  this.putUser = (username, password) =>  {
    return this.client.User.userPUT({username: username, password: { password: password } });
  }

  this.vote = (playlist_id, song_id, direction) => {
    return this.client.Vote.votePOST({name: playlist_id, song_id: song_id, vote: direction });
  }

  this.getSongMetadata = (searchTerm) => {
    return this.client.default.get_song_metadata({ q: searchTerm});
  }

  return this;
}

module.exports = sdk;
