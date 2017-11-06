import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { Link, withRouter } from 'react-router-dom';
import { withScreenSize, withData } from './hocs';
import { ApiPlaylists } from '../sdk';
import { Scrollbars } from 'react-custom-scrollbars';
import { createPlaylist } from '../state/actions';

class CreatePlaylistForm extends React.Component<any> {
	state = { name: '' };
	node: any = null;
	inputRef: any = null;

	componentDidMount() {
		document.addEventListener('click', this.onClick);
		this.inputRef.focus();
	}

	componentWillUnmount() {
		document.removeEventListener('click', this.onClick);
	}

	onClick = e => {
		const { target } = e;
		const { tagName } = target;
		const role = target.getAttribute('role');

		const outsideClick = !this.node.contains(target);
		const targetIsButton = role === 'button';
		const targetIsLink = role === 'link' || tagName === 'A';

		if (outsideClick || targetIsButton || targetIsLink) {
			this.props.onClose();
		}
	};
	submit = e => {
		e && e.preventDefault && e.preventDefault();
		this.props.createPlaylist({ playlistName: this.state.name, userId: this.props.userId });
		this.props.onClose();
		this.props.history.push(`/p/${this.state.name}`);
	};

	render() {
		return (
			<div
				className="create-playlist-form"
				style={{ display: 'flex', position: 'absolute', top: 0 }}
				ref={c => (this.node = c)}
			>
				<form>
					<input
						type="text"
						placeholder="playlist name"
						value={this.state.name}
						onChange={(e: any) => this.setState({ name: e.target.value })}
						style={{
							border: 0,
							backgroundColor: 'inherit',
							width: 150,
							paddingLeft: 20,
							paddingRight: 10,
							color: 'white',
						}}
						ref={c => (this.inputRef = c)}
					/>
					<i className="fa fa-plus" onClick={this.submit} />
					<input type="submit" style={{ display: 'none' }} onClick={this.submit} />
				</form>
			</div>
		);
	}
}

const ConnectedCreatePlaylistForm: any = connect(null, { createPlaylist })(
	withRouter(CreatePlaylistForm)
);

class Sidebar extends React.Component<any> {
	state = { isOpen: false, showCreatePlaylist: false };
	createPlaylistRef: any = null;
	componentWillMount() {
		document.addEventListener('keydown', e => {
			if (e.keyCode === 27) {
				this.setState({ showCreatePlaylist: false });
			}
		});
	}
	componentWillUnmount() {
		document.removeEventListener('keydown');
	}

	toggleOpen = () => this.setState({ isOpen: !this.state.isOpen });

	renderThumb({ style, ...props }) {
		return <div style={{ ...style, color: 'white', backgroundColor: 'white' }} {...props} />;
	}

	render() {
		const { isWidescreen } = this.props;
		const show = isWidescreen || this.state.isOpen;
		const playlists = _.sortBy(_.values(this.props.playlists), 'name');

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
							<div className="sidebar__menu">
								{/* <p> All Playlists</p> */}
								<p
									onClick={() =>
										this.setState({ showCreatePlaylist: !this.state.showCreatePlaylist })}
									ref={c => (this.createPlaylistRef = c)}
								>
									Create Playlist
								</p>
								<hr />
								{playlists &&
									_.map(playlists, (playlist: ApiPlaylists) => {
										return (
											<Link to={`/p/${playlist.name}`} key={playlist.id}>
												{playlist.name}
											</Link>
										);
									})}
							</div>
						</Scrollbars>
						{this.state.showCreatePlaylist &&
							<ConnectedCreatePlaylistForm
								onClose={() => this.setState({ showCreatePlaylist: false })}
								userId={this.props.user && this.props.user.id}
							/>}
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
