import * as React from 'react';
import { connect } from 'react-redux';

import { logout, loginUser as login, fetchUsers } from '../state/actions';
import { getCurrentUser } from '../state/reducer';
import sdk from '../sdk';

type Props = {
	login: (login) => {};
	logout: () => {};
	onRegister: any;
	loggedIn: boolean;
	username: string;
	fetchUsers: any;
};

class LoginDropdown extends React.Component<Props> {
	async componentDidMount() {
		this.props.fetchUsers();
		try {
			let login = localStorage.getItem('login');
			if (login) {
				login = JSON.parse(login);
				console.error(login);
				this.props.login(login);
			}
		} catch (err) {
			console.error(err, err.stack);
		}
	}

	state = {
		username: '',
		password: 'todo',
		showForm: false,
	};

	toggleForm = () => this.setState({ showForm: !this.state.showForm });

	handleLogin = () => {
		const { username, password } = this.state;
		this.toggleForm();
		this.props.login({ username, password });
	};
	handleLogout = () => {
		this.toggleForm();
		this.props.logout();
		localStorage.removeItem('login');
	};

	handleRegister = () => {
		console.log('attempting to create user');
		const { username, password } = this.state;
		// todo move to async action
		sdk.putUser(username, password).then(resp => this.handleLogin());
	};

	handleUsernameChange = event => this.setState({ username: event.target.value });

	render() {
		const { loggedIn, username } = this.props;
		let loginText = username ? `@${username}` : 'Login';

		return (
			<div className="login-dropdown">
				<h3 className="header__login pointer" onClick={this.toggleForm}>
					{loginText} <i className="fa fa-caret-down" />
				</h3>
				{this.state.showForm &&
					<div className="header__login-form">
						{loggedIn &&
							<div className="header__login-form-dropdown">
								<a onClick={this.handleLogout} className="header__login-form-logout-button">
									<span>
										<i className="fa fa-sign-out" /> Log out
									</span>
								</a>
							</div>}
						{!loggedIn &&
							<form className="header__login-form-dropdown">
								<input
									type="text"
									placeholder="username"
									value={this.state.username}
									onChange={this.handleUsernameChange}
									style={{ width: 180 }}
								/>
								<div style={{ display: 'flex', justifyContent: 'space-between' }}>
									<a onClick={this.handleRegister} className="header__logintext">
										New account
									</a>
									<a onClick={this.handleLogin} className="header__logintext">
										<span className="glyphicon glyphicon-log-in" /> Log in
									</a>
								</div>
								<input type="submit" style={{ display: 'none' }} onClick={this.handleLogin} />
							</form>}
					</div>}
			</div>
		);
	}
}

function mapStateToProps(state) {
	const username = getCurrentUser(state).username;
	const loggedIn = !!username;
	return { username, loggedIn };
}

export default connect<any, any, any>(mapStateToProps, { login, logout, fetchUsers })(
	LoginDropdown
);
