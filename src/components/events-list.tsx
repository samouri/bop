import * as _ from 'lodash';
import * as React from 'react';
// import { connect } from 'react-redux';
// import * as cx from 'classnames';
import { Link } from 'react-router-dom';

const SongEvent = ({ event }) => {
	const { song, user } = event;
	if (!song) {
		return null;
	}

	const playlistName = song.playlists.name;
	return (
		<div>
			@{user && user.username} added {song.metadata.title} to{' '}
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
			@{user && user.username} upvoted {song.metadata.title} in {' '}
			<Link to={`/p/${playlistName}`}>{playlistName}</Link>
		</div>
	);
};

const Event = ({ event }) => {
	const { eventType } = event;
	switch (eventType) {
		case 'song':
			return <SongEvent event={event} />;
		case 'vote':
			return <VoteEvent event={event} />;
	}
	return (
		<div>
			<span>
				@{event.user && event.user.username} added a {eventType}
			</span>
		</div>
	);
};

class EventsList extends React.Component<any> {
	renderEventsList = () => {
		const { events } = this.props;
		if (_.isEmpty(events)) {
			return <p> Nothing has ever happened </p>;
		} else {
			return _.map(events, (event: any) =>
				<Event key={event.id + event.eventType} event={event} />
			);
		}
	};

	render() {
		return (
			<div>
				{this.renderEventsList()}
			</div>
		);
	}
}

export default EventsList;
