import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { fetchUsers, fetchSongs } from '../state/actions';
import { Link } from 'react-router-dom';
import { getUserScores } from '../state/reducer';

type Props = {
	scores;
	users;
	dispatch: any;
};
class LeaderboardsPage extends React.Component<Props> {
	fetchSongs = _.throttle(() => this.props.dispatch(fetchSongs()), 1000);
	fetchUsers = _.throttle(() => this.props.dispatch(fetchUsers()), 1000);

	componentWillMount() {
		this.fetchSongs();
		this.fetchSongs();
	}

	render() {
		const { scores } = this.props;
		const sortedUsers = _.reverse(_.sortBy(scores, 'score'));
		console.error(sortedUsers);
		return (
			<div className="feed-page" style={{}}>
				<span className="feed-page__title" style={{ display: 'flex', flexDirection: 'column' }}>
					<h2 style={{ textAlign: 'center', paddingBottom: '20px', paddingTop: '20px' }}>
						Leaderboard
					</h2>
					<table className="table table-striped">
						<tr>
							<th> User </th> <th> Points (songs added) </th>
						</tr>
						{_.map(sortedUsers, user =>
							<tr>
								<th>
									<Link to={`/u/${user.username}`}>
										@{user.username}
									</Link>
								</th>
								<th>
									{user.score}
								</th>
							</tr>
						)}
					</table>
				</span>
			</div>
		);
	}
}

export default connect<{}, {}, Props>(state => ({
	scores: getUserScores(state),
}))(LeaderboardsPage);
