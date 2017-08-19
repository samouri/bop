import * as React from 'react';
import { connect } from 'react-redux';
// import * as _ from 'lodash';
import * as cx from 'classnames';
import Player from 'react-player';
import * as Mousetrap from 'mousetrap';

import {
	getNextSong,
	getPrevSong,
	getCurrentPlaylist,
	getCurrentPlayer,
	PlayerState,
	getDenormalizedSong,
	DenormalizedSong,
} from '../state/reducer';
import { playSong, pauseSong, shuffleSongs } from '../state/actions';

const YOUTUBE_PREFIX = 'https://www.youtube.com/watch?v=';

const opts = {
	playerVars: {
		// https://developers.google.com/youtube/player_parameters
		autoplay: 0,
		controls: 1,
		enablejsapi: 1,
		modestbranding: 1,
		playsinline: 1,
		iv_load_policy: 3, // don't show annotations by default
		autohide: 0,
	},
	preload: true,
};

class PlayingBar extends React.Component<Props> {
	componentDidMount() {
		Mousetrap.bind('space', this.handlePausePlay);
	}
	componentWillUnmount() {
		Mousetrap.unbind('space');
	}

	playNextSong = () => this.props.dispatch(playSong({ songId: this.props.nextSong }));
	playPrevSong = () => this.props.dispatch(playSong({ songId: this.props.prevSong }));
	handleOnPlay = () => this.props.dispatch(playSong({}));
	handleOnEnd = () => this.playNextSong();
	handleOnPause = () => this.props.dispatch(pauseSong());
	handlePausePlay = e => {
		e.preventDefault();

		this.props.player.playing
			? this.props.dispatch(pauseSong())
			: this.props.dispatch(playSong({}));
	};

	render() {
		const { player: { playing, shuffle }, playlist, song } = this.props;

		if (!song) {
			return null;
		}

		var playOrPauseClasses = cx('fa fa-2x pointer', {
			'fa-pause': playing,
			'fa-play': !playing,
		});

		return (
			<div className="playing-bar">
				<div className="playing-bar__width-wrapper">
					<div className="playing-bar__play-info">
						<img className="playing-bar__thumb" src={song.metadata.thumbnail_url} />
						<span className="playing-bar__arttit">
							<span className="playing-bar__title">
								{song.metadata.title}
							</span>
							<span className="playing-bar__artist">
								{song.metadata.artist}
							</span>
						</span>
					</div>
					<div className="playing-bar__play-controls">
						<i className="fa fa-2x fa-fast-backward pointer" onClick={this.playPrevSong} />
						<i className={playOrPauseClasses} onClick={this.handlePausePlay} />
						<i className="fa fa-2x fa-fast-forward pointer" onClick={this.playNextSong} />
						<i
							className={cx('fa fa-2x fa-random pointer', { active: shuffle })}
							onClick={() => this.props.dispatch(shuffleSongs({ playlistId: playlist.id }))}
						/>
					</div>
					<div className="playing-bar__player">
						<Player
							playing={playing}
							url={`${YOUTUBE_PREFIX}${song && song.metadata.youtube_id}`}
							height={50}
							width={300}
							youtubeConfig={opts}
							onEnded={this.handleOnEnd}
							onPause={this.handleOnPause}
							onPlay={this.handleOnPlay}
						/>
					</div>
				</div>
			</div>
		);
	}
}

type StateProps = {
	nextSong: any;
	getSongById: any;
	playlist: any;
	prevSong: any;
	player: PlayerState;
	song: DenormalizedSong;
};
type Props = StateProps & { dispatch };

export default connect(state => ({
	player: getCurrentPlayer(state),
	nextSong: getNextSong(state),
	prevSong: getPrevSong(state),
	playlist: getCurrentPlaylist(state),
	song: getDenormalizedSong(state, { id: getCurrentPlayer(state).song }),
}))(PlayingBar);
