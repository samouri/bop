import * as React from 'react';
import { connect } from 'react-redux';

import { logout } from '../state/actions';
import { getUsername, getCurrentPlaylistName } from '../state/reducer';
import { Link } from 'react-router-dom';

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
		const { username } = this.props;
		let loginText = username ? `@${username}` : 'Login';

		return (
			<div>
				<div className="header">
					<h1 className="header__bop pointer">
						<Link to="/"> Bop </Link>
					</h1>
					<h3 className="header__login pointer" onClick={this.handleClick}>
						{loginText} <i className="fa fa-caret-down" />
					</h3>
				</div>
				<div className="header__login-form">
					{this.state.showLoginForm &&
						!this.props.username &&
						<form className="header__login-form-dropdown">
							<input
								type="text"
								placeholder="username"
								value={this.state.username}
								onChange={this.handleUsernameChange}
							/>
							{/* <input
								type="password"
								placeholder="password"
								value={this.state.password}
								onChange={this.handlePasswordChange}
							/> */}
							<div style={{ display: 'flex' }}>
								<a onClick={this.handleRegister} className="header__logintext">
									new account
								</a>
								<a onClick={this.handleLogin} className="header__logintext">
									<span className="glyphicon glyphicon-log-in" /> Log in
								</a>
							</div>
							<input type="submit" style={{ display: 'none' }} onClick={this.handleLogin} />
						</form>}

					{this.state.showLogoutForm &&
						<a onClick={this.handleLogout} className="header__login-form-dropdown">
							<span className="glyphicon glyphicon-log-out" /> Log out
						</a>}
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
