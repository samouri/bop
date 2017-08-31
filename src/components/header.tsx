import * as React from 'react';
// import * as _ from 'lodash';
import { connect } from 'react-redux';

import { getCurrentUser } from '../state/reducer';
import { Link } from 'react-router-dom';
import LoginDropdown from './login-dropdown';

class Header extends React.Component<Props> {
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
	return { user };
};

type PassedProps = {};
type StateProps = { user: any };
type Props = PassedProps & StateProps & { dispatch };

export default connect<StateProps, any, PassedProps>(mapStateToProps)(Header);
