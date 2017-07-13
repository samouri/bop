import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import * as Youtube from 'react-youtube';
import * as cx from 'classnames';

import Header from './header';
import SearchBar from './searchbar';
import FTUEHero from './ftueBanner';
import SongRow from './song-row';

import BopSdk from '../sdk';
import {
	fetchSongs,
	loginUser,
	playSong,
	pauseSong,
	setSort,
	shuffleSongs,
	requestPlaylist,
	setPlaylistName,
} from '../state/actions';
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
} from '../state/reducer';

let sdk: any;

const YOUTUBE_PREFIX = 'https://www.youtube.com/watch?v=';
const TOP = 'top';
const NEW = 'new';

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

type Props = {
	match: { params: any };
	dispatch: any;
	playlist: any;
	nextSong: any;
	songs: any;
	currentPlaylistName: any;
	player: any;
	currentSong: any;
	getSongById: any;
	user: any;
	sort: any;
	showFTUEHero: boolean;
};
class PlaylistPage extends React.Component<Props> {
	player: any = false;
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

	componentWillMount() {
		const { match: { params }, dispatch } = this.props;
		if (params.playlistName) {
			dispatch(setPlaylistName(params.playlistName));
		}
	}
	fetchSongs = _.throttle(
		(props = this.props) => props.dispatch(fetchSongs(props.playlist.id)),
		200
	);
	componentWillReceiveProps(nextProps) {
		if (_.isEmpty(nextProps.songs) && nextProps.playlist) {
			this.fetchSongs(nextProps);
		}
	}

	async componentDidMount() {
		sdk = window.sdk = await new BopSdk();
		this.props.dispatch(requestPlaylist(this.props.currentPlaylistName));

		try {
			let login = localStorage.getItem('login');
			if (login) {
				login = JSON.parse(login);
				this.props.dispatch(loginUser(login));
			}
		} catch (err) {
			console.error(err, err.stack);
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
			let selectedVideoId = this.props.songs[0].metadata.youtube_id;

			this.player.cueVideoById({ videoId: selectedVideoId });
			this.setState({ selectedVideoId });
		}
	};

	handleSearchSelection = async spotifyMeta => {
		const { playlist, user } = this.props;
		let songMeta = await sdk.getSongMetadata({ spotifyId: spotifyMeta.spotify_id });
		// if we don't have the meta for it yet, create it
		if (!songMeta) {
			const youtubeMeta = await sdk.searchYoutube({
				title: spotifyMeta.title,
				artist: spotifyMeta.artist,
			});
			// maybe its multiple tracks that correspond to the same song
			songMeta = await sdk.getSongMetadata({ youtubeId: youtubeMeta.youtube_id });
			if (!songMeta) {
				const youtubeDuration = await sdk.getYoutubeVideoDuration(youtubeMeta.youtube_id);
				youtubeMeta.youtube_duration = youtubeDuration.youtube_duration;
				songMeta = await sdk.addSongMetadata({ youtubeMeta, spotifyMeta });
			}
		}

		sdk
			.addSongToPlaylist({ userId: user.id, playlistId: playlist.id, metaId: songMeta.id })
			.then(() => this.fetchSongs())
			.catch(err => {
				console.error('seems like we couldnt add a song', err, err.stack);
			});
	};

	handleOnPlay = songId => {
		this.props.dispatch(playSong(this.props.currentSong.songId));
	};

	handleRegister = login => {
		console.log('attempting to create user');
		sdk.putUser(login.username, login.password).then(resp => {
			this.props.dispatch(loginUser(login));
		});
	};

	playVideo(songId) {
		if (this.props.currentSong.invalidatedSong) {
			// only reload video if its new
			const videoId = this.props.getSongById(songId).metadata.youtube_id;
			this.player.loadVideoById(videoId);
		}
		this.player.playVideo();
	}

	renderSongsList = () => {
		if (_.isEmpty(this.props.songs)) {
			return <p> Theres a first for everything </p>;
		} else {
			return _.map(this.props.songs, (song: any) =>
				<li className="list-group-item" key={`song-${song.id}`}>
					<SongRow songId={song.id} />
				</li>
			);
		}
	};

	render() {
		const { playlist } = this.props;
		const sort = this.props.sort.sort;
		const shuffle = this.props.sort.shuffle;
		var hotBtnClasses = cx('filter-btn', 'pointer', { active: sort === TOP });
		var newBtnClasses = cx('filter-btn', 'pointer', { active: sort === NEW });
		var shuffleBtnClasses = cx('pointer', 'fa', 'fa-random', { active: shuffle });

		if (this.props.currentSong && this.props.currentSong.playing) {
			this.playVideo(this.props.currentSong.songId);
		} else if (this.props.currentSong && !this.props.currentSong.playing) {
			this.player.pauseVideo();
		}

		const ret = (
			<div className="row">
				<div className="row">
					<Header
						onLogin={(login: any) => this.props.dispatch(loginUser(login))}
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
							onClick={() => this.props.dispatch(shuffleSongs(playlist.id))}
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
						<SearchBar handleSelection={_.throttle(this.handleSearchSelection, 100)} />
					</div>
				</div>
				<div className="row">
					<ul className="list-group">
						{this.renderSongsList()}
					</ul>
				</div>
			</div>
		);
		console.log(ret);
		return <h1> WHY</h1>;
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

export default connect<{}, {}, Props>(mapStateToProps)(PlaylistPage);
