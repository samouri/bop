import * as React from 'react';
import { connect } from 'react-redux';

import { getUsername, getCurrentPlaylistName } from '../state/reducer';
import { Link } from 'react-router-dom';
import LoginDropdown from './login-dropdown';

type PassedProps = {};
type StateProps = {
	username: string;
	playlist: any;
};
type Props = PassedProps & StateProps;

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
			<div className="header">
				<h1 className="header__bop pointer">
					<Link to="/"> Bop </Link>
				</h1>
				<LoginDropdown />
			</div>
		);
	}
}

const mapStateToProps = state => {
	const username = getUsername(state);
	const playlist = getCurrentPlaylistName(state);
	return { username, playlist };
};

export default connect<StateProps, any, PassedProps>(mapStateToProps)(Header);
