// import * as _ from 'lodash';
import * as React from 'react';
import * as _ from 'lodash';
import * as cx from 'classnames';
import * as moment from 'moment';
import { Link } from 'react-router-dom';
import { withSongControls } from './hocs';

import { DenormalizedSong } from '../state/reducer';
import { default as Slider } from 'react-slick';

class CombinedSongEvent extends React.Component<any> {
	sliderRef = null;
	state = { current: 0 };

	handleSliderMouseOver = i => {
		// console.error(i);
		// this.sliderRef && (this.sliderRef as any).slickGoTo(i);
	};

	handleSliderChange = i => {
		this.setState({ current: i });
	};

	render() {
		const event: any = this.props.event;

		if (!event || !event.combined || !event.song) {
			return null;
		}

		const settings = {
			slidesToShow: 5,
			draggable: true,
			speed: 500,
			focusOnSelect: false,
			centerMode: true,
			infinite: true,
			swipeToSlide: true,
			useCSS: true,
		};

		const thumbs = _.map(event.combined, (evt: any, i: number) => {
			return (
				<div key={`${evt.eventType}-${evt.id}`}>
					<i className="fa fa-play combined-song-event__play" />
					<img height="75px" src={evt.song.metadata.thumbnail_url} />
				</div>
			);
		});
		const currEvent = event.combined[this.state.current];

		return (
			<div style={{ paddingBottom: '20px' }}>
				<SongEvent event={event} />
				<ConnectedSingleEvent
					event={currEvent}
					stream={this.props.stream}
					showContextLine={false}
				/>
				<div>
					<Slider
						{...settings}
						ref={c => (this.sliderRef = c)}
						afterChange={this.handleSliderChange}
					>
						{thumbs}
					</Slider>
				</div>
			</div>
		);
	}
}

const SongEvent = ({ event }) => {
	const { song, user } = event;
	if (!song) {
		return null;
	}

	let action = 'added a song to';
	if (event.combined) {
		action = `added ${event.combined.length} songs to`;
	}

	const playlistName = song.playlists.name;
	return (
		<div>
			<Link to={`/u/${user.username}`}>@{user && user.username}</Link> {action}{' '}
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
			<Link to={`/u/${user && user.username}`}>@{user && user.username}</Link> upvoted a song on{' '}
			<Link to={`/p/${playlistName}`}>{playlistName}</Link>
		</div>
	);
};

class SingleEvent extends React.Component<Props> {
	state = {
		hovered: false,
		voteModifier: 0,
	};

	handleMouseOver = () => this.setState({ hovered: true });
	handleMouseOut = e => this.setState({ hovered: false });

	durationToString() {
		var duration = moment.duration(this.props.event.song.metadata.youtube_duration);
		var duration_minutes = duration.minutes();
		var duration_seconds: any = duration.seconds();
		if (duration_seconds < 10) {
			duration_seconds = '0' + duration_seconds;
		}
		return duration_minutes + ':' + duration_seconds;
	}

	render() {
		const { event, isPlaying, isSelected, isUpvoted, showContextLine = true, vote } = this.props;
		const { eventType, song } = event;

		const metadata = song.metadata || {};
		const ContextRow =
			eventType === 'song' ? <SongEvent event={event} /> : <VoteEvent event={event} />;

		const playOrPauseClasses = cx('fa', 'fa-2x', {
			'fa-pause': isPlaying,
			'fa-play': !isPlaying,
			'selected-purple': isSelected,
		});
		const backgroundColor = isPlaying || this.state.hovered ? 'lightgray' : '';

		const handlePausePlay = isPlaying ? () => this.props.pause : () => this.props.play;
		const upChevronClasses = cx('fa fa-lg fa-chevron-up pointer', {
			'up-chevron-selected': isUpvoted,
		});

		return (
			<div
				className="event-row"
				onMouseEnter={this.handleMouseOver}
				onMouseLeave={this.handleMouseOut}
				onDoubleClick={handlePausePlay}
				style={{ backgroundColor }}
			>
				{showContextLine && ContextRow}
				<div className="event-row__song">
					<span className="event-row__song-play-info">
						<span className="event-row__song-upvote">
							<i className={upChevronClasses} onClick={vote} />
						</span>
						<span className="event-row__controls">
							{(isPlaying || this.state.hovered) &&
								<i className={playOrPauseClasses} onClick={handlePausePlay} />}
						</span>
					</span>
					<img className="event-row__thumb" src={metadata.thumbnail_url} />
					<span className="event-row__arttit">
						<span className="event-row__song-title">
							{metadata.title}
						</span>
						<span className="event-row__song-artist">
							{metadata.artist}
						</span>
						<span className="event-row__song-duration">
							{this.durationToString()}
						</span>
					</span>
				</div>
			</div>
		);
	}
}

const EventRow = ({ event, stream }) => {
	if (event.eventType === 'song' && event.combined) {
		return <CombinedSongEvent event={event} stream={stream} />;
	}
	return <ConnectedSingleEvent event={event} stream={stream} />;
};

type Props = {
	dispatch: any;
	event: { song: DenormalizedSong; eventType; combined };
	isPlaying: boolean;
	isSelected: boolean;
	stream: any;
	loggedInUser: any;
	showContextLine;
	isUpvoted: boolean;
	vote;
	pause;
	play;
};
const ConnectedSingleEvent = withSongControls(SingleEvent);

export default EventRow;
