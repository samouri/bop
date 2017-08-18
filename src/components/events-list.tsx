import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
// import * as cx from 'classnames';
import { getSongById } from '../state/reducer';

const SongEvent = ({ song }) => {
	if (!song) {
		return null;
	}
	return (
		<div>
			{song.name} was added by {song.userAdded}
		</div>
	);
};

const Event = ({ eventType, userAdded, id, song }) => {
	switch (eventType) {
		case 'song':
			return <SongEvent song={song} />;
	}
	return (
		<div>
			<span>{eventType}</span> was added by {userAdded}
		</div>
	);
};

const ConnectedEvent = connect<any, any, any>((state, ownProps) => {
	const { id, eventType } = ownProps;
	switch (eventType) {
		case 'song':
			return { song: getSongById(state, id) };
		case 'vote':
			return { song: getSongById(state, id) };
		case 'playlist':
			return { song: getSongById(state, id) };
	}
	return {};
})(Event);

class EventsList extends React.Component<any> {
	renderEventsList = () => {
		const { events } = this.props;
		if (_.isEmpty(events)) {
			return <p> Nothing has ever happened </p>;
		} else {
			return _.map(events, (event: any) =>
				<ConnectedEvent
					key={event.id + event.eventType}
					eventType={event.eventType}
					userAdded={event.userAdded}
					id={event.id}
				/>
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
