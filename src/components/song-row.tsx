import * as React from 'react';
import * as cx from 'classnames';
import * as _ from 'lodash';
import * as moment from 'moment';
import { connect } from 'react-redux';
import { getCurrentSong, getSongById, getUser } from '../state/reducer';
import { Link } from 'react-router-dom';
import sdk, { ApiSongData } from '../sdk';

import { playSong, pauseSong, deleteSong } from '../state/actions';

type Props = {
	song: ApiSongData;
	isUpvoted: boolean;
	isSelected: boolean;
	isPlaying: boolean;
	user: any;
	dispatch: any;
};

class SongRow extends React.Component<Props> {
	state = {
		voteModifier: 0,
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

	getAge = () => moment.utc(this.props.song.date_added).fromNow();

	handleUpvote = () => {
		const { isUpvoted } = this.props;
		const vote = isUpvoted ? -1 : 1;
		const voteModifier = this.state.voteModifier !== 0 ? 0 : vote;

		this.setState({ voteModifier });

		const voteParams = { songId: this.props.song.id, userId: this.props.user.id };
		isUpvoted ? sdk.unvote(voteParams) : sdk.vote(voteParams);
	};

	handleDelete = () => this.props.dispatch(deleteSong(this.props.song));
	handleMouseOver = () => this.setState({ hovered: true });
	handleMouseOut = e => this.setState({ hovered: false });

	render() {
		const { title, artist, thumbnail_url } = _.get(this.props.song, 'metadata') || ({} as any);
		const { id: songId, votes } = this.props.song;
		var playOrPauseClasses = cx('fa', 'fa-2x', {
			'fa-pause': this.props.isPlaying,
			'fa-play': !this.props.isPlaying,
			'selected-purple': this.props.isSelected,
		});

		var upChevronClasses = cx('fa fa-chevron-up pointer', {
			'up-chevron-selected':
				(this.props.isUpvoted && this.state.voteModifier !== -1) || this.state.voteModifier === 1,
		});

		const handlePausePlay = this.props.isPlaying
			? () => this.props.dispatch(pauseSong())
			: () => this.props.dispatch(playSong({ songId }));

		const playlistName = this.props.song.playlists.name;
		return (
			<div
				className="song-div row-eq-height"
				onMouseEnter={this.handleMouseOver}
				onMouseLeave={this.handleMouseOut}
				onDoubleClick={handlePausePlay}
			>
				<div className="play-info">
					{this.state.hovered && <i className={playOrPauseClasses} onClick={handlePausePlay} />}
				</div>
				<div className="vote-info">
					<i className={upChevronClasses} onClick={this.handleUpvote} />
					<span className="vote-count">
						{votes.length + this.state.voteModifier}
					</span>
				</div>
				<span className="song-title">
					{title}
				</span>
				<span className="song-artist">
					{artist}
				</span>
				<Link to={`/p/${playlistName}`} className="song-playlist">
					{playlistName}{' '}
				</Link>
				<span className="song-date">
					{this.getAge()}
				</span>
				<span className="song-postee">
					{this.props.song.user.username}
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

function mapStateToProps(state, ownProps) {
	const song: any = getSongById(state, ownProps.songId);
	const currentSong: any = getCurrentSong(state);
	const isSelected = currentSong && currentSong.songId === song.id;
	const isPlaying = isSelected && currentSong.playing;
	const user: any = getUser(state);

	return {
		song,
		isSelected,
		isPlaying,
		isUpvoted: !!_.find(song.votes, { user_added: user.id }),
		user,
	};
}

export default connect(mapStateToProps)(SongRow);
