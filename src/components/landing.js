import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import Youtube from 'react-youtube';
import cx from 'classnames';

import Header from './header';
import SearchBar from './searchbar';
import FTUEHero from './ftueBanner';
import SongRow from './song-row';

import BopSdk from '../sdk';
import {
	fetchSongsSuccess,
	fetchSongs,
	loginUser,
	playSong,
	pauseSong,
	setSort,
	shuffleSongs,
	requestPlaylist,
} from '../app/actions';
import {
	getCurrentSort,
	getCurrentPlaylistName,
	getUpvotedSongs,
	getUsername,
	getCurrentSong,
	getSongById,
	getSortedSongs,
	getNextSong,
	getUser,
	getCurrentPlaylist,
} from '../app/reducer';

let sdk;

const YOUTUBE_PREFIX = 'https://www.youtube.com/watch?v=';
const TOP = 'top';
const NEW = 'new';
const SHUFFLE = 'shuffle';

const opts = {
	playerVars: {
		// https://developers.google.com/youtube/player_parameters
		autoplay: 0,
		controls: 1,
		enablejsapi: 1,
		modestbranding: 1,
		playsinline: 1,
	},
};

class Landing extends React.Component {
	state = {
		selectedVideoId: null,
		playing: false,
		songs: [],
		page: 0,
		sort: TOP,
		upvotes: {},
		userInfo: {},
		sdk: null,
	};

	async componentDidMount() {
		sdk = window.sdk = await new BopSdk();
		this.props.dispatch(requestPlaylist(this.props.currentPlaylistName));

		try {
			let login = localStorage.getItem('login');
			if (login) {
				login = JSON.parse(login);
				this.props.dispatch(loginUser(login, sdk));
			}
		} catch (err) {
			console.error(err, err.stack);
		}
	}
	fetchSongs = _.throttle(() => this.props.dispatch(fetchSongs(this.props.playlist.id)), 200);
	componentWillReceiveProps(nextProps) {
		if (_.isEmpty(this.props.songs) && this.props.playlist) {
			this.fetchSongs();
		}
	}

	handleOnPause = event => {
		this.props.dispatch(pauseSong(this.props.currentSong.songId));
	};

	handleOnEnd = () => {
		// play next song
		this.props.dispatch(playSong(this.props.nextSong));
	};

	handleOnReady = e => {
		// set player
		this.player = e.target;

		if (this.props.songs.length > 0) {
			let selectedVideoId = this.props.songs[0].youtube_id;

			this.player.cueVideoById({ videoId: selectedVideoId });
			this.setState({ selectedVideoId });
		}
	};

	handleSearchSelection = async spotifyMeta => {
		const { playlist, user } = this.props;
		let songMeta = await sdk.getSongMetadata(spotifyMeta.spotify_id);
		// if we don't have the meta for it yet, create it
		if (songMeta.obj.length === 0) {
			const youtubeMeta = await sdk.searchYoutube({
				title: spotifyMeta.title,
				artist: spotifyMeta.artist,
			});
			songMeta = (await sdk.addSongMetadata({ youtubeMeta, spotifyMeta })).obj[0];
		} else {
			songMeta = songMeta.obj[0];
		}

		// TODO add in for optim case
		sdk
			.addSongToPlaylist({ userId: user.id, playlistId: playlist.id, metaId: songMeta.id })
			.catch(err => {
				console.error('seems like we couldnt add a song', err, err.stack);
			});
	};

	handleOnPlay = songId => {
		this.props.dispatch(playSong(this.props.currentSong.songId));
	};

	handleRegister = login => {
		console.log('attempting to create user');
		this.state.sdk.putUser(login.username, login.password).then(resp => {
			this.props.dispatch(loginUser(login, sdk));
		});
	};

	playVideo(songId) {
		if (this.props.currentSong.invalidatedSong) {
			// only reload video if its new
			const videoId = this.props.getSongById(songId).youtube_id;
			this.player.loadVideoById(videoId);
		}
		this.player.playVideo();
	}

	renderSongsList = () => {
		if (_.isEmpty(this.props.songs)) {
			return <p> Theres a first for everything </p>;
		} else {
			return _.map(this.props.songs, song => (
				<li className="list-group-item">
					<SongRow songId={song.id} key={`song-${song.id}`} />
				</li>
			));
		}
	};

	render() {
		const sort = this.props.sort.sort;
		const shuffle = this.props.sort.shuffle;
		let { playlist = 'Seattle' } = this.props.params;
		var hotBtnClasses = cx('filter-btn', 'pointer', { active: sort === TOP });
		var newBtnClasses = cx('filter-btn', 'pointer', { active: sort === NEW });
		var shuffleBtnClasses = cx('pointer', 'fa', 'fa-random', { active: shuffle });

		let songs = this.props.songs;

		if (this.props.currentSong && this.props.currentSong.playing) {
			this.playVideo(this.props.currentSong.songId);
		} else if (this.props.currentSong && !this.props.currentSong.playing) {
			this.player.pauseVideo();
		}

		return (
			<div className="row">
				<div className="row">
					<Header
						onLogin={login => this.props.dispatch(loginUser(login, sdk))}
						onRegister={this.handleRegister}
					/>
				</div>

				{this.props.showFTUEHero && <FTUEHero />}

				<div className={this.props.showFTUEHero ? 'hidden' : 'row'}>
					<Youtube
						url={YOUTUBE_PREFIX}
						id={'video'}
						opts={opts}
						onEnd={this.handleOnEnd}
						onReady={this.handleOnReady}
						onPause={this.handleOnPause}
						onPlay={this.handleOnPlay}
					/>
				</div>
				<div className={'row'} id={'gradient_bar'}>
					<div className="col-xs-offset-4 cols-xs-1">
						<i
							className={shuffleBtnClasses}
							onClick={() => this.props.dispatch(shuffleSongs(playlist))}
						/>
					</div>
					<div className="btn-group col-xs-3" role="group">
						<div className={hotBtnClasses} onClick={() => this.props.dispatch(setSort(TOP))}>
							Hot
						</div>
						<div className={newBtnClasses} onClick={() => this.props.dispatch(setSort(NEW))}>
							New
						</div>
					</div>
					<div className="col-xs-4 col-xs-offset-1">
						{' '}
						<SearchBar handleSelection={_.throttle(this.handleSearchSelection, 100)} sdk={sdk} />
						{' '}
					</div>
				</div>
				<div className="row">
					<ul className="list-group">
						{this.renderSongsList()}
					</ul>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	return {
		songs: getSortedSongs(state),
		user: getUser(state),
		username: getUsername(state),
		upvotedSongs: getUpvotedSongs(state),
		currentSong: getCurrentSong(state),
		currentPlaylistName: getCurrentPlaylistName(state),
		playlist: getCurrentPlaylist(state),
		showFTUEHero: getCurrentSong(state) === null,
		getSongById: _.partial(getSongById, state),
		sort: getCurrentSort(state),
		nextSong: getNextSong(state),
	};
}

export default connect(mapStateToProps)(Landing);
