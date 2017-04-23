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

/* action creators */
function requestSongs(playlistId) {
	return {
		type: FETCH_SONGS_REQUEST,
		playlistId,
	};
}

export function fetchSongsSuccess(playlistId, songs) {
	return {
		type: FETCH_SONGS_SUCCESS,
		playlistId,
		songs,
	};
}

function fetchSongsFailure(playlistId) {
	return {
		type: FETCH_SONGS_FAILURE,
		playlistId,
	};
}

export function requestLogin(user) {
	return {
		type: LOGIN_USER_REQUEST,
		user,
	};
}

export function logout(user) {
	return {
		type: LOGOUT_USER,
	};
}

export function loginUserSuccess(username, upvotedSongs) {
	return {
		type: LOGIN_USER_SUCCESS,
		username,
		upvotedSongs,
	};
}

export function playSong(songId) {
	return {
		type: PLAY_SONG,
		songId,
	};
}

export function pauseSong(songId) {
	return {
		type: PAUSE_SONG,
		songId,
	};
}

export function setSort(sort) {
	return {
		type: SET_SORT,
		sort,
	};
}

export function shuffleSongs(playlistId) {
	return {
		type: SHUFFLE_SONGS,
		playlistId,
	};
}

export function loginUserFailure(user) {
	return {
		type: LOGIN_USER_FAILURE,
		user,
	};
}

export function addSongToPlaylist(song, playlistId) {
	return {
		type: ADD_SONG_TO_PLAYLIST,
		playlistId,
	};
}

/* Thunk Async Actions */

export const fetchSongs = (playlistId, sdk) => dispatch => {
	dispatch(requestSongs(playlistId));

	return sdk
		.getSongsInPlaylist(playlistId, 0, 200)
		.then(response => {
			dispatch(fetchSongsSuccess(playlistId, response.obj.songs));
		}) // api fetch
		.catch(error => dispatch(fetchSongsFailure(playlistId)));
};

export const loginUser = (login, sdk) => dispatch => {
	dispatch(requestLogin(login.username));

	sdk.login(login);

	return sdk
		.getUser()
		.then(res => {
			dispatch(loginUserSuccess(login.username, res.obj.upvotedSongs));

			localStorage.setItem('login', JSON.stringify(login));
		})
		.catch(error => {
			console.error(error, error.stack);
			dispatch(loginUserFailure(login.username));
		});
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

export const deleteSong = (song, sdk) => dispatch => {
	const { playlist_id, youtube_id } = song;

	sdk
		.deleteSong(playlist_id, youtube_id)
		.then(res => {
			console.log('successfully deleted song', res);
			//dispatch( fetchSongsSuccess( song.playlist_id, [ res.obj.song ] ) );
		})
		.catch(error => console.error(error, error.stack));

	dispatch({
		type: DELETE_SONG,
		song,
		playlistId: song.playlist_id,
	});
};
