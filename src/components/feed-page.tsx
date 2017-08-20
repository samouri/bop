import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import Header from './header';
import EventsList from './events-list';

import { fetchEvents, fetchSongsInPlaylist, loginUser } from '../state/actions';
import { getEventsDenormalized, getCurrentUser } from '../state/reducer';

type Props = {
	events: Array<any>;
	dispatch: any;
};
class FeedPage extends React.Component<Props> {
	fetchEvents = _.throttle((props = this.props) => props.dispatch(fetchEvents({})), 1000);
	fetchSongs = _.throttle(
		(props = this.props) => props.dispatch(fetchSongsInPlaylist({ playlistId: 17 })),
		1000
	);

	componentWillMount() {
		this.fetchEvents();
		this.fetchSongs();
	}

	async componentDidMount() {
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

	render() {
		const { events } = this.props;

		return (
			<div>
				<Header />
				<EventsList events={events} />
			</div>
		);
	}
}

export default connect<{}, {}, Props>(state => ({
	user: getCurrentUser(state),
	events: getEventsDenormalized(state),
}))(FeedPage);
