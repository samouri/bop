import Swagger from 'swagger-client';
import config from './config';

export default function BopSdk() {
	this.loaded = false;

	this.getSongsInPlaylist = function(playlist_id, start = 0, size = 20) {
		return this.client.default.getSongsInPlaylist({ playlist_id, start, size });
	};

	this.addSongToPlaylist = function(playlist_id, song) {
		return this.client.default.addSongToPlaylist({ playlist_id, song });
	};

	this.getUser = (optionalUsername, optionalPassword) => {
		if (optionalUsername && optionalPassword) {
			return this.client.default.getUser(null, {
				clientAuthorizations: {
					basicAuth: new Swagger.PasswordAuthorization(optionalUsername, optionalPassword),
				},
			});
		}
		return this.client.default.getUser();
	};

	this.putUser = (username, password) => {
		return this.client.default.createUser({ username, password: { password: password } });
	};

	this.vote = (playlist_id, youtube_id) => {
		return this.client.default.voteOnSong({ playlist_id, youtube_id });
	};

	this.deleteSong = (playlist_id, youtube_id) => {
		return this.client.default.deleteSong({ playlist_id, youtube_id });
	};

	this.login = function({ username, password }) {
		this.client.clientAuthorizations.add('basicAuth', new Swagger.PasswordAuthorization(username, password));
	};

	this.getSongMetadata = searchTerm => this.client.default.get_song_metadata({ q: searchTerm });

	return new Swagger({ url: config.swaggerUrl, usePromise: true })
		.then(client => {
			this.client = client;
			if (config.swaggerHost) {
				client.setHost(config.swaggerHost);
			}
			return this;
		})
		.catch(error => console.error('could not load the sdk, what to do, what to do'));
}
