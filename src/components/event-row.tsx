// import * as _ from 'lodash';
import * as React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { Link } from 'react-router-dom';
import { playSong, pauseSong } from '../state/actions';
import { getCurrentUser, DenormalizedSong, getCurrentPlayer } from '../state/reducer';

const SongEvent = ({ event }) => {
	const { song, user } = event;
	if (!song) {
		return null;
	}

	const playlistName = song.playlists.name;
	return (
		<div>
			<Link to={`/u/${user.username}`}>@{user && user.username}</Link> added a song to{' '}
			<Link to={`/p/${playlistName}`}>{playlistName}</Link>
		</div>
	);
};

const VoteEvent = ({ event }) => {
	const { song, user } = event;
	if (!song) {
		return null;
	}

	const playlistName = song.playlists.name;
	return (
		<div>
			<Link to={`/u/${user && user.username}`}>@{user && user.username}</Link> added a song to{' '}
			<Link to={`/p/${playlistName}`}>{playlistName}</Link>
		</div>
	);
};

class EventRow extends React.Component<Props> {
	state = { hovered: false };

	handleMouseOver = () => this.setState({ hovered: true });
	handleMouseOut = e => this.setState({ hovered: false });

	render() {
		const { event, isPlaying, isSelected, stream } = this.props;
		const { eventType, song } = event;

		if (!song) {
			console.error('count not find song -- why is this happening?', song, event);
			return null;
		}

		const metadata = song.metadata || {};
		const ContextRow =
			eventType === 'song' ? <SongEvent event={event} /> : <VoteEvent event={event} />;

		const playOrPauseClasses = cx('fa', 'fa-2x', {
			'fa-pause': isPlaying,
			'fa-play': !isPlaying,
			'selected-purple': isSelected,
		});
		const backgroundColor = isPlaying || this.state.hovered ? 'lightgray' : '';

		const handlePausePlay = isPlaying
			? () => this.props.dispatch(pauseSong())
			: () => this.props.dispatch(playSong({ songId: song.id, stream }));

		return (
			<div
				className="event-row"
				onMouseEnter={this.handleMouseOver}
				onMouseLeave={this.handleMouseOut}
				onDoubleClick={handlePausePlay}
				style={{ backgroundColor }}
			>
				{ContextRow}
				<div className="event-row__song">
					<span className="event-row__song-play-info">
						{(isPlaying || this.state.hovered) &&
							<i className={playOrPauseClasses} onClick={handlePausePlay} />}
					</span>
					<img className="event-row__thumb" src={metadata.thumbnail_url} />
					<span className="event-row__arttit">
						<span className="event-row__song-title">
							{metadata.title}
						</span>
						<span className="event-row__song-artist">
							{metadata.artist}
						</span>
					</span>
				</div>
			</div>
		);
	}
}

type Props = {
	dispatch: any;
	event: { song: DenormalizedSong; eventType };
	isPlaying: boolean;
	isSelected: boolean;
	stream: any;
};
export default connect<any, any, any>((state, ownProps) => {
	const player = getCurrentPlayer(state);
	const song: DenormalizedSong = ownProps.event.song;
	const isSelected = song && player.song === song.id;
	const isPlaying = isSelected && player.playing;
	const user: any = getCurrentUser(state);

	return {
		isSelected,
		isPlaying,
		isUpvoted: song && !!_.find(song.votes, { user_added: user.id }),
		user,
	};
})(EventRow);
