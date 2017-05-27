/* action types */
export const FETCH_SONGS_REQUEST = 'FETCH_SONGS_REQUEST';
export const FETCH_SONGS_SUCCESS = 'FETCH_SONGS_SUCCESS';
export const FETCH_SONGS_FAILURE = 'FETCH_SONGS_FAILURE';

export const ADD_SONG_TO_PLAYLIST = 'ADD_SONG_TO_PLAYLIST';

export const LOGIN_USER_REQUEST = 'USER_LOGIN_REQUEST';
export const LOGIN_USER_SUCCESS = 'USER_LOGIN_SUCCESS';
export const LOGIN_USER_FAILURE = 'USER_LOGIN_FAILURE';
export const LOGOUT_USER = 'LOGOUT_USER';
export const PLAY_SONG = 'PLAY_SONG';
export const PAUSE_SONG = 'PAUSE_SONG';
export const VOTE_SONG = 'VOTE_SONG';
export const SET_SORT = 'SET_SORT';
export const DELETE_SONG = 'DELETE_SONG';
export const SHUFFLE_SONGS = 'SHUFFLE_SONGS';
export const RECEIVE_PLAYLIST = 'RECEIVE_PLAYLIST';
export const SET_PLAYLIST_NAME = 'SET_PLAYLIST_NAME';

/* action creators */
export const requestSongs = playlistId => ({
	type: FETCH_SONGS_REQUEST,
	payload: {
		playlist: { id: playlistId },
	},
});

export const setPlaylistName = playlistName => ({
	type: SET_PLAYLIST_NAME,
	payload: {
		name: playlistName,
	},
});

export function fetchSongsSuccess(playlistId, songs) {
	return {
		type: FETCH_SONGS_SUCCESS,
		payload: {
			playlist: { id: playlistId },
		},
		songs,
	};
}

export const fetchSongsFailure = playlistId => {
	return {
		type: FETCH_SONGS_FAILURE,
		playlistId,
	};
};

export const requestLogin = user => ({
	type: LOGIN_USER_REQUEST,
	user,
});

export const logout = user => ({
	type: LOGOUT_USER,
});

export const loginUserSuccess = (username, upvotedSongs, id) => ({
	type: LOGIN_USER_SUCCESS,
	username,
	upvotedSongs,
	id,
});

export const playSong = songId => ({
	type: PLAY_SONG,
	songId,
});

export const pauseSong = songId => ({
	type: PAUSE_SONG,
	songId,
});

export const setSort = sort => ({
	type: SET_SORT,
	sort,
});

export const shuffleSongs = playlistId => ({
	type: SHUFFLE_SONGS,
	payload: {
		playlist: { id: playlistId },
	},
});

export const loginUserFailure = user => ({
	type: LOGIN_USER_FAILURE,
	user,
});

export const addSongToPlaylist = (song, playlistId) => ({
	type: ADD_SONG_TO_PLAYLIST,
	playlistId,
});

export const receivePlaylist = playlist => ({
	type: RECEIVE_PLAYLIST,
	payload: { playlist },
});

/* Thunk Async Actions */

export const requestPlaylist = playlistName => async dispatch => {
	const sdk = window.sdk;
	try {
		const playlist = await sdk.getPlaylistForName(playlistName);
		dispatch(receivePlaylist(playlist));
	} catch (err) {
		// TODO this is a hack for now to add the playlist if it doens't exist
		await sdk.createPlaylist({ playlistName });
		const playlist = await sdk.getPlaylistForName(playlistName);
		dispatch(receivePlaylist(playlist));
		console.error(err);
	}
};

export const fetchSongs = playlistId => async dispatch => {
	const sdk = window.sdk;
	dispatch(requestSongs(playlistId));
	try {
		const songs = await sdk.getSongsInPlaylist({ playlistId, offset: 0, limit: 200 });
		dispatch(fetchSongsSuccess(playlistId, songs));
	} catch (err) {
		dispatch(fetchSongsFailure(err));
	}
};

export const loginUser = (login, sdk) => async dispatch => {
	dispatch(requestLogin(login.username));
	try {
		const user = await sdk.getUser(login.username);
		dispatch(loginUserSuccess(user.username, [], user.id));
		localStorage.setItem('login', JSON.stringify(login));
	} catch (error) {
		console.error(error, error.stack);
		dispatch(loginUserFailure(login.username));
	}
};

// TODO actually make this async correctly
export function voteSong(song, dir, sdk, dispatch) {
	sdk
		.vote(song.playlist_id, song.youtube_id, dir)
		.then(res => {
			console.log('successfully votes song', res);
			//dispatch( fetchSongsSuccess( song.playlist_id, [ res.obj.song ] ) );
		})
		.catch(error => console.error(error, error.stack));

	dispatch({
		type: VOTE_SONG,
		songId: song._id,
	});
}

export const deleteSong = song => dispatch => {
	const sdk = window.sdk;
	sdk
		.deleteSong(song.id)
		.then(res => {
			console.log('successfully deleted song', res);
			//dispatch( fetchSongsSuccess( song.playlist_id, [ res.obj.song ] ) );
		})
		.catch(error => console.error(error, error.stack));

	dispatch({
		type: DELETE_SONG,
		song,
		payload: { playlist: { id: song.playlist_id } },
	});
};
