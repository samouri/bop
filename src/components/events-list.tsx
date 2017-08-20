import * as _ from 'lodash';
import * as React from 'react';
// import { connect } from 'react-redux';
import Event from './event-row';

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
