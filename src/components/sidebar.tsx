import * as React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router-dom';
import { withScreenSize, withData } from './hocs';
import { ApiPlaylists } from '../sdk';
import { Scrollbars } from 'react-custom-scrollbars';

class Sidebar extends React.Component<any> {
	state = { isOpen: false };

	toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

	renderThumb({ style, ...props }) {
		return <div style={{ ...style, color: 'white', backgroundColor: 'white' }} {...props} />;
	}

	render() {
		const { isWidescreen } = this.props;
		const show = isWidescreen || this.state.isOpen;
		const playlists = _.sortBy(_.values(this.props.playlists), 'name');
		console.error(playlists);

		return (
			<div>
				{!isWidescreen &&
					<div className="sidebar-hamburger" onClick={this.toggleOpen}>
						<i className="fa fa-bars hamburger-menu" />
					</div>}
				{show &&
					<div className="sidebar">
						<Scrollbars
							autoHide
							renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
						>
							<div className="sidebar__menu" ss-container>
								<p> All Playlists</p>
								<p> Create Playlist</p>
								<hr />
								{playlists &&
									_.map(playlists, (playlist: ApiPlaylists) => {
										return (
											<Link to={`/p/${playlist.name}`}>
												{playlist.name}
											</Link>
										);
									})}
							</div>
						</Scrollbars>
					</div>}
			</div>
		);
	}
}

export const SidebarSpacer = withScreenSize(({ isWidescreen }) => {
	const paddingLeft = isWidescreen ? 200 : 0;
	return <div style={{ paddingLeft, display: 'flex' }} />;
});

export default withScreenSize(withData(Sidebar));
