import * as React from 'react';
import { connect } from 'react-redux';

import { logout } from '../state/actions';
import { getUsername, getCurrentPlaylistName } from '../state/reducer';

type PassedProps = {
	onLogin: any;
	onRegister: any;
};
type StateProps = {
	username: any;
	playlist: any;
};
type DispatchProps = {
	handleLogout: any;
};
type Props = PassedProps & StateProps & DispatchProps;

class Header extends React.Component<Props> {
	state = {
		showLogoutForm: false,
		showLoginForm: false,
		username: '',
		password: '',
	};

	handleLogout = () => {
		this.setState({ showLogoutForm: false });
		this.props.handleLogout();
	};

	handleLogin = e => {
		e.preventDefault();

		this.setState({ showLoginForm: false });

		this.props.onLogin({
			username: this.state.username,
			password: this.state.password,
		});
	};

	handleRegister = e => {
		e.preventDefault();

		this.setState({ showLoginForm: false });

		this.props.onRegister({
			username: this.state.username,
			password: this.state.password,
		});
	};

	handleClick = () => {
		if (this.props.username) {
			this.setState({ showLogoutForm: !this.state.showLogoutForm });
		} else {
			this.setState({ showLoginForm: !this.state.showLoginForm });
		}
	};

	handleUsernameChange = event => {
		this.setState({ username: event.target.value });
	};

	handlePasswordChange = event => {
		this.setState({ password: event.target.value });
	};

	render() {
		let loginText = this.props.username || 'Login';

		return (
			<div id="header" className="row">
				<div className="col-xs-4">
					{' '}<h1 id="bop_header" className="pull-left">
						{' '}Bop{' '}
					</h1>
					<h2 id="seattle_header" className="pull-left">
						{' '}{this.props.playlist.substring(0, 10)}{' '}
					</h2>
				</div>
				<div className="col-xs-3 col-xs-offset-5">
					<h3 className="pull-right pointer" onClick={this.handleClick}>
						{' '}{loginText}{' '}
					</h3>
					{this.state.showLoginForm &&
						!this.props.username &&
						<div className="dropdown-menu" style={{ padding: '17px' }}>
							<form>
								<input
									type="text"
									placeholder="username"
									value={this.state.username}
									onChange={this.handleUsernameChange}
								/>
								<input
									type="password"
									placeholder="password"
									value={this.state.password}
									onChange={this.handlePasswordChange}
								/>
								<div style={{ display: 'flex' }}>
									<a onClick={this.handleRegister} className="header__logintext">
										new account
									</a>
									<a onClick={this.handleLogin} className="header__logintext">
										<span className="glyphicon glyphicon-log-in" /> Log in
									</a>
								</div>
								<input type="submit" style={{ display: 'none' }} onClick={this.handleLogin} />
							</form>
						</div>}
					{this.state.showLogoutForm &&
						<div className="dropdown-menu" style={{ marginLeft: '120px' }}>
							<a onClick={this.handleLogout} className="btn btn-info btn-lg">
								<span className="glyphicon glyphicon-log-out" /> Log out
							</a>
						</div>}
				</div>
			</div>
		);
	}
}

function mapStateToProps(state) {
	const username = getUsername(state);
	const playlist = getCurrentPlaylistName(state);
	return { username, playlist };
}

function mapDispatchToProps(dispatch) {
	const handleLogout = () => dispatch(logout());
	return { handleLogout };
}

export default connect<StateProps, DispatchProps, PassedProps>(mapStateToProps, mapDispatchToProps)(
	Header
);
