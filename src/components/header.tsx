import * as React from 'react';
// import * as _ from 'lodash';
import { connect } from 'react-redux';

import { getCurrentPlaylist, getCurrentUser } from '../state/reducer';
import { Link } from 'react-router-dom';
import LoginDropdown from './login-dropdown';
import { loginUser } from '../state/actions';

class Header extends React.Component<Props> {
	state = {
		showForm: false,
		username: '',
	};

	async componentDidMount() {
		try {
			let login = localStorage.getItem('login');
			console.error(login);
			if (login) {
				login = JSON.parse(login);
				console.error(login);
				this.props.dispatch(loginUser(login));
			}
		} catch (err) {
			console.error(err, err.stack);
		}
	}

	handleToggleForm = () => this.setState({ showForm: !this.state.showForm });

	handleUsernameChange = event => {
		this.setState({ username: event.target.value });
	};

	render() {
		const { user } = this.props;
		return (
			<div style={{ height: 50 }}>
				<div className="header">
					<div className="header__width-wrapper">
						<div className="header__left-nav">
							<h1 className="header__bop pointer">
								<i className="fa fa-headphones" />
								<Link to="/"> Bop </Link>
							</h1>
							<Link to={`/u/${user.username}`}> Songs </Link>
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
type Props = PassedProps & StateProps & { dispatch };

export default connect<StateProps, any, PassedProps>(mapStateToProps)(Header);
