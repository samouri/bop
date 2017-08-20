import * as React from 'react';
// import * as _ from 'lodash';
import { connect } from 'react-redux';

import { getCurrentPlaylist, getCurrentUser } from '../state/reducer';
import { Link } from 'react-router-dom';
import LoginDropdown from './login-dropdown';

class Header extends React.Component<Props> {
	state = {
		showForm: false,
		username: '',
	};

	handleToggleForm = () => this.setState({ showForm: !this.state.showForm });

	handleUsernameChange = event => {
		this.setState({ username: event.target.value });
	};

	render() {
		return (
			<div style={{ height: 50 }}>
				<div className="header">
					<div className="header__width-wrapper">
						<div className="header__left-nav">
							<h1 className="header__bop pointer">
								<i className="fa fa-headphones" />
								<Link to="/"> Bop </Link>
							</h1>
							<Link to="/"> Songs </Link>
						</div>
						<LoginDropdown />
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => {
	const user = getCurrentUser(state);
	const playlist = getCurrentPlaylist(state);
	return { user, playlist };
};

type PassedProps = {};
type StateProps = {
	user: any;
	playlist: any;
};
type Props = PassedProps & StateProps;

export default connect<StateProps, any, PassedProps>(mapStateToProps)(Header);
