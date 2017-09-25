import * as React from 'react';
import { withScreenSize } from './hocs';

class Sidebar extends React.Component<any> {
	state = { isOpen: false };

	toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

	render() {
		const { isWidescreen } = this.props;
		const show = isWidescreen || this.state.isOpen;
		return (
			<div>
				{!isWidescreen &&
					<div className="sidebar-hamburger" onClick={this.toggleOpen}>
						<i className="fa fa-bars hamburger-menu" />
					</div>}
				{show &&
					<div className="sidebar">
						<div className="sidebar__menu">
							<p> All Playlists</p>
							<p> Create Playlist</p>
						</div>
					</div>}
			</div>
		);
	}
}

export default withScreenSize(Sidebar);
