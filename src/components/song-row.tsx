import * as React from 'react';
import * as cx from 'classnames';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DenormalizedSong } from '../state/reducer';
import { Link } from 'react-router-dom';
import * as momentTwitter from 'moment-twitter';
import { withSongControls } from './hocs';

import { deleteSong } from '../state/actions';

type Props = {
	song: DenormalizedSong;
	isUpvoted: boolean;
	isSelected: boolean;
	isPlaying: boolean;
	user: any;
	dispatch: any;
	stream: object;
	voteCount: number;
	vote;
	play;
	pause;
};

class SongRow extends React.Component<Props> {
	state = {
		hovered: false,
	};

	durationToString() {
		var duration = moment.duration(this.props.song.metadata.youtube_duration);
		var duration_minutes = duration.minutes();
		var duration_seconds: any = duration.seconds();
		if (duration_seconds < 10) {
			duration_seconds = '0' + duration_seconds;
		}
		return duration_minutes + ':' + duration_seconds;
	}

	getAge = () => momentTwitter.utc(this.props.song.date_added).twitterLong();

	handleDelete = () => this.props.dispatch(deleteSong(this.props.song));
	handleMouseOver = () => this.setState({ hovered: true });
	handleMouseOut = e => this.setState({ hovered: false });

	render() {
		if (!this.props.song) {
			return null;
		}
		const { title, artist } = _.get(this.props.song, 'metadata', {}) as any;
		const { isPlaying, isUpvoted, voteCount, vote } = this.props;

		var playOrPauseClasses = cx('fa', 'fa-2x', {
			'fa-pause': isPlaying,
			'fa-play': !isPlaying,
			'selected-purple': this.props.isSelected,
		});

		var upChevronClasses = cx('fa fa-chevron-up pointer', {
			'up-chevron-selected': isUpvoted,
		});

		const handlePausePlay = isPlaying ? this.props.pause : this.props.play;
		const playlistName = this.props.song.playlists.name;
		const backgroundColor = isPlaying || this.state.hovered ? 'lightgray' : '';
		return (
			<div
				className="song-div row-eq-height"
				onMouseEnter={this.handleMouseOver}
				onMouseLeave={this.handleMouseOut}
				onDoubleClick={handlePausePlay}
				style={{ backgroundColor }}
			>
				<span className="play-info">
					{(isPlaying || this.state.hovered) &&
						<i className={playOrPauseClasses} onClick={handlePausePlay} />}
				</span>
				<span className="vote-info">
					<i className={upChevronClasses} onClick={vote} />
					<span className="vote-count">
						{voteCount}
					</span>
				</span>
				<span className="song-title">
					{title}
				</span>
				<span className="song-artist">
					{artist}
				</span>
				<span className="song-playlist">
					<Link to={`/p/${playlistName}`}>
						{playlistName}
					</Link>
				</span>
				<span className="song-date">
					{this.getAge()}
				</span>
				<span className="song-postee">
					<Link to={`/u/${this.props.song.user.username}`}>
						{this.props.song.user.username}
					</Link>
				</span>
				<span className="song-duration">
					{this.durationToString()}
				</span>
				{/* <div>
					{(!this.props.song.user_added || this.props.song.user_added === this.props.user.id) &&
						<div
							onClick={this.handleDelete}
							style={{ cursor: 'pointer', paddingTop: '35px', color: 'red' }}
						>
							X
						</div>}
				</div> */}
			</div>
		);
	}
}

export default withSongControls(SongRow);
