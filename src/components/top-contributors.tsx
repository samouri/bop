import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import { getContributorsInCurrentPlaylist } from '../state/reducer';

type StateProps = {
	contributors: string[];
};

type Props = StateProps;

class TopContributors extends React.Component<Props> {
	render() {
		const contribs = _.map(this.props.contributors, name =>
			<span className="topcontributors__contrib" key={name}>
				@{name}
			</span>
		);
		return (
			<div className="topcontributors">
				<span> Top Contributors</span>
				{contribs}
			</div>
		);
	}
}

export default connect(state => ({ contributors: getContributorsInCurrentPlaylist(state) }))(
	TopContributors
);
